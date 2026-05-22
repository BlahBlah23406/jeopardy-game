import { useState, useEffect, useCallback } from 'react';
import { GamePhase, Player, Team, Category, AdvantageCard, Question } from './types';
import { InputScreen } from './components/InputScreen';
import { TeamAssignment } from './components/TeamAssignment';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { AddPlayerModal } from './components/AddPlayerModal';
import { Toast } from './components/Toast';
import { PlayerAddedModal } from './components/PlayerAddedModal';
import { generateGameData, generateFinalJeopardyQuestions } from './lib/game-data';
import { DraftingScreen } from './components/DraftingScreen';
import { FinalJeopardyGame } from './components/FinalJeopardyGame';
import { QuestionSetupScreen } from './components/QuestionSetupScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { RulesScreen } from './components/RulesScreen';

function App() {
    const [phase, setPhase] = useState<GamePhase>('SETUP');
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [pointsMultiplier, setPointsMultiplier] = useState(1);
    const [notification, setNotification] = useState<string | null>(null);
    const [playerAddedInfo, setPlayerAddedInfo] = useState<{ playerName: string; teamName: string } | null>(null);

    const [draftingPool, setDraftingPool] = useState<Player[]>([]);
    const [draftingOrder, setDraftingOrder] = useState<string[]>([]);
    const [currentDrafterIndex, setCurrentDrafterIndex] = useState(0);
    const [finalJeopardyQuestions, setFinalJeopardyQuestions] = useState<Question[]>([]);
    const [winningTeamId, setWinningTeamId] = useState<string | null>(null);

    const [_customCategories, setCustomCategories] = useState<Category[]>([]);
    const [customFinalJeopardyQuestions, setCustomFinalJeopardyQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSetupComplete = (categories: Category[], fjQuestions: Question[]) => {
        setCustomCategories(categories);
        setCustomFinalJeopardyQuestions(fjQuestions);

        const gameData = generateGameData(categories);
        setCategories(gameData);

        setPhase('INPUT');
    };

    const handleStartGame = (playerNames: string[]) => {
        const shuffled = [...playerNames].sort(() => Math.random() - 0.5);

        const players: Player[] = shuffled.map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            name
        }));

        // Dynamically assign team count (minimum 2, max 4) based on square root of player count
        const totalPlayers = players.length;
        const optimalTeamCount = Math.min(4, Math.max(2, Math.round(Math.sqrt(totalPlayers))));

        const teamNames = [
            'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
            'Team Epsilon', 'Team Zeta', 'Team Eta', 'Team Theta',
            'Team Iota', 'Team Kappa', 'Team Lambda', 'Team Mu'
        ];

        const newTeams: Team[] = [];
        for (let i = 0; i < optimalTeamCount; i++) {
            const name = teamNames[i] || `Team ${i + 1}`;
            newTeams.push({
                id: (i + 1).toString(),
                name,
                players: [],
                score: 0,
                playedPlayerIds: [],
                inventory: []
            });
        }

        // Distribute players evenly among teams
        players.forEach((player, index) => {
            newTeams[index % optimalTeamCount].players.push(player);
        });

        setTeams(newTeams);
        setPhase('ASSIGNMENT');
    };

    const handleTransitionToGame = () => {
        setPhase('INTRO_RULES');
        // Set random active team or first team
        setActiveTeamId(teams[0]?.id || null);
    };

    const handleStartGamePlay = () => {
        setPhase('GAME');
    };

    const handleUpdateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
        setTeams(prev => prev.map(team => {
            if (team.id !== teamId) return team;

            // Enforce limit of 2 inventory cards
            let finalUpdates = { ...updates };
            if (updates.inventory && updates.inventory.length > 2) {
                if (team.inventory.length >= 2 && updates.inventory.length > team.inventory.length) {
                    setNotification(`Inventory Full! ${team.name} cannot hold more than 2 cards!`);
                    finalUpdates.inventory = team.inventory;
                }
            }

            return { ...team, ...finalUpdates };
        }));
    }, []);

    const handleAddPlayer = (name: string) => {
        const sortedTeams = [...teams].sort((a, b) => {
            if (a.players.length !== b.players.length) {
                return a.players.length - b.players.length;
            }
            return Math.random() - 0.5;
        });

        const targetTeam = sortedTeams[0];
        const newPlayer: Player = {
            id: Math.random().toString(36).substr(2, 9),
            name
        };

        handleUpdateTeam(targetTeam.id, {
            players: [...targetTeam.players, newPlayer]
        });

        setPlayerAddedInfo({ playerName: name, teamName: targetTeam.name });
    };

    const handleActivateCard = useCallback((team: Team, card: AdvantageCard) => {
        if (card.type === 'DOUBLE_POINTS') {
            setPointsMultiplier(2);
        } else if (card.type === 'STEAL_SELECTION') {
            setActiveTeamId(team.id);
        } else if (card.type === 'RESET_REP') {
            handleUpdateTeam(team.id, { playedPlayerIds: [] });
        }

        const newInventory = (team.inventory || []).filter(c => c.id !== card.id);
        handleUpdateTeam(team.id, { inventory: newInventory });
    }, [handleUpdateTeam]);

    const handleQuestionAnswered = useCallback((questionId: string) => {
        setCategories(prev => prev.map(cat => {
            const hasQuestion = cat.questions.some(q => q.id === questionId);
            if (!hasQuestion) return cat;

            return {
                ...cat,
                questions: cat.questions.map(q =>
                    q.id === questionId ? { ...q, isAnswered: true } : q
                )
            };
        }));
    }, []);

    const handleAddPlayerRequest = useCallback(() => setIsAddPlayerModalOpen(true), []);
    const handleQuestionSelected = useCallback(() => setPointsMultiplier(1), []);

    // Check for Game Over
    useEffect(() => {
        if (phase === 'GAME' && categories.length > 0) {
            const allAnswered = categories.every(cat => cat.questions.every(q => q.isAnswered));
            if (allAnswered) {
                const timer = setTimeout(() => setPhase('FINAL_JEOPARDY_RULES'), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [categories, phase]);

    // --- Final Jeopardy Logic ---

    const handleTransitionToDrafting = () => {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        const captains = winner.players.map(p => ({ ...p }));

        const pool: Player[] = [];
        teams.forEach(t => {
            if (t.id !== winner.id) {
                pool.push(...t.players);
            }
        });

        const newTeams: Team[] = captains.map((captain) => ({
            id: `fj-team-${captain.id}`,
            name: captain.name,
            players: [captain],
            score: 0,
            playedPlayerIds: [],
            inventory: []
        }));

        const captainIds = newTeams.map(t => t.id);
        const shuffledOrder = [...captainIds].sort(() => Math.random() - 0.5);

        setTeams(newTeams);
        setDraftingPool(pool);
        setDraftingOrder(shuffledOrder);
        setCurrentDrafterIndex(0);
        setPhase('DRAFTING');
        setNotification(`Drafting Phase! ${winner.name} members are now Captains!`);
    };

    const handleDraftPick = (player: Player) => {
        const currentTeamId = draftingOrder[currentDrafterIndex];

        setTeams(prev => prev.map(t =>
            t.id === currentTeamId
                ? { ...t, players: [...t.players, player] }
                : t
        ));

        const newPool = draftingPool.filter(p => p.id !== player.id);
        setDraftingPool(newPool);

        // Advance to next drafter using round-robin distribution
        const nextIndex = (currentDrafterIndex + 1) % draftingOrder.length;
        setCurrentDrafterIndex(nextIndex);

        if (newPool.length === 0) {
            handleTransitionToFinalJeopardy();
        }
    };

    const handleTransitionToFinalJeopardy = () => {
        setFinalJeopardyQuestions(generateFinalJeopardyQuestions(customFinalJeopardyQuestions));
        setPhase('FINAL_JEOPARDY');
    };

    const handleFinalJeopardyEnd = (finalWinnerId: string) => {
        setWinningTeamId(finalWinnerId);
        setPhase('WINNER');
    };

    return (
        <div className="min-h-screen bg-game-dark text-white p-4 overflow-hidden relative font-sans">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2342&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />

            {pointsMultiplier > 1 && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-black font-black px-6 py-2 rounded-full shadow-lg border-2 border-white animate-pulse">
                    DOUBLE POINTS ACTIVE!
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center min-h-[90vh]">
                {phase === 'SETUP' && (
                    <QuestionSetupScreen onComplete={handleSetupComplete} />
                )}

                {phase === 'INPUT' && (
                    <InputScreen onStartGame={handleStartGame} />
                )}

                {phase === 'ASSIGNMENT' && (
                    <TeamAssignment
                        teams={teams}
                        onConfirm={handleTransitionToGame}
                        onUpdateTeam={handleUpdateTeam}
                    />
                )}

                {phase === 'INTRO_RULES' && (
                    <RulesScreen
                        title="PARTY JEOPARDY RULES"
                        rules={[
                            { text: "Teams take turns picking a category and point value.", icon: "🎯" },
                            { text: "The team that picks reads the question out loud.", icon: "🗣️" },
                            { text: "For VERBAL questions: The rep MUST grab the PLUSHIE to answer!", icon: "🧸", highlight: true },
                            { text: "For PLAYED challenges: Follow the specific instructions provided.", icon: "🎮", highlight: true },
                            { text: "ANY team can buzz in to answer (shout your team name!).", icon: "📢" },
                            { text: "Use Advantage Cards strategically to mess with opponents!", icon: "🃏" }
                        ]}
                        onContinue={handleStartGamePlay}
                    />
                )}

                {phase === 'GAME' && (
                    <>
                        <GameBoard
                            categories={categories}
                            teams={teams}
                            onUpdateTeam={handleUpdateTeam}
                            onSetActiveTeam={setActiveTeamId}
                            onAddPlayerRequest={handleAddPlayerRequest}
                            pointsMultiplier={pointsMultiplier}
                            onQuestionSelected={handleQuestionSelected}
                            onQuestionAnswered={handleQuestionAnswered}
                        />
                        <button
                            onClick={() => setPhase('FINAL_JEOPARDY_RULES')}
                            className="fixed bottom-4 right-4 text-sm opacity-100 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl z-50 border-2 border-white font-bold"
                        >
                            Force End Game
                        </button>
                        <ScoreBoard
                            teams={teams}
                            activeTeamId={activeTeamId}
                            onSetActiveTeam={setActiveTeamId}
                            onUpdateTeam={handleUpdateTeam}
                            onActivateCard={handleActivateCard}
                        />
                    </>
                )}

                {phase === 'FINAL_JEOPARDY_RULES' && (
                    <RulesScreen
                        title="THE ENDGAME BEGINS"
                        rules={[
                            { text: "The WINNING TEAM is about to be disbanded.", icon: "💔" },
                            { text: "Its members will become CAPTAINS for the final battle.", icon: "👑" },
                            { text: "Captains will draft their new squads from the losers.", icon: "👥" },
                            { text: "Everything leads to one final question.", icon: "⚡" },
                            { text: "Points don't matter anymore. Only GLORY matters.", icon: "🏆", highlight: true }
                        ]}
                        onContinue={handleTransitionToDrafting}
                    />
                )}

                {phase === 'DRAFTING' && (
                    <DraftingScreen
                        teams={teams}
                        draftingPool={draftingPool}
                        currentDrafterId={draftingOrder[currentDrafterIndex]}
                        onPick={handleDraftPick}
                    />
                )}

                {phase === 'FINAL_JEOPARDY' && (
                    <FinalJeopardyGame
                        teams={teams}
                        questions={finalJeopardyQuestions}
                        onUpdateTeam={handleUpdateTeam}
                        onGameEnd={handleFinalJeopardyEnd}
                    />
                )}

                {phase === 'WINNER' && winningTeamId && (
                    <WinnerScreen
                        winnerName={teams.find(t => t.id === winningTeamId)?.name || 'Unknown'}
                    />
                )}
            </div>

            <AddPlayerModal
                isOpen={isAddPlayerModalOpen}
                onClose={() => setIsAddPlayerModalOpen(false)}
                onAdd={handleAddPlayer}
            />

            <Toast
                message={notification}
                onClose={() => setNotification(null)}
            />

            <PlayerAddedModal
                isOpen={!!playerAddedInfo}
                onClose={() => setPlayerAddedInfo(null)}
                playerName={playerAddedInfo?.playerName || ''}
                teamName={playerAddedInfo?.teamName || ''}
            />
        </div>
    );
}

export default App;
