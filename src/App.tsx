import { useState, useEffect } from 'react';
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

    // Final Jeopardy State
    const [draftingPool, setDraftingPool] = useState<Player[]>([]);
    const [draftingOrder, setDraftingOrder] = useState<string[]>([]); // Team IDs
    const [currentDrafterIndex, setCurrentDrafterIndex] = useState(0);
    const [finalJeopardyQuestions, setFinalJeopardyQuestions] = useState<Question[]>([]);
    const [winningTeamId, setWinningTeamId] = useState<string | null>(null);

    // Custom Data from Setup
    const [_customCategories, setCustomCategories] = useState<Category[]>([]);
    const [customFinalJeopardyQuestions, setCustomFinalJeopardyQuestions] = useState<Question[]>([]);

    // Initialize Game Data
    // We only generate data when transitioning from Setup -> Input (or on Setup complete)
    // useEffect(() => {
    //     setCategories(generateGameData());
    // }, []);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSetupComplete = (categories: Category[], fjQuestions: Question[]) => {
        setCustomCategories(categories);
        setCustomFinalJeopardyQuestions(fjQuestions);

        // Generate Game Data using custom inputs (or defaults if empty)
        const gameData = generateGameData(categories);
        setCategories(gameData);

        setPhase('INPUT');
    };

    const handleStartGame = (playerNames: string[]) => {
        // 1. Shuffle players
        const shuffled = [...playerNames].sort(() => Math.random() - 0.5);

        // 2. Create players objects
        const players: Player[] = shuffled.map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            name
        }));

        // 3. Determine Number of Teams (Square Heuristic)
        // Try to make Teams ~= Players Per Team => Teams = sqrt(Total Players)
        // Minimum 2 teams
        const totalPlayers = players.length;
        const optimalTeamCount = Math.max(2, Math.round(Math.sqrt(totalPlayers)));

        const teamNames = [
            'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
            'Team Epsilon', 'Team Zeta', 'Team Eta', 'Team Theta',
            'Team Iota', 'Team Kappa', 'Team Lambda', 'Team Mu'
        ];

        // 4. Create Teams
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

        // 5. Distribute players
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

    const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
        setTeams(prev => prev.map(team => {
            if (team.id !== teamId) return team;

            // Inventory Limit Logic check
            // If we are updating inventory, check length
            let finalUpdates = { ...updates };
            if (updates.inventory && updates.inventory.length > 2) {
                // If trying to add beyond 2, keep only first 2 or burn the new one?
                // Logic: "Limit to two cards in inventory at once"
                // Usually means you can't pick up the new one.
                // Since this update usually comes from "adding a card", we should check existing.
                // However, updates.inventory is the *new* full list.
                // Creating a new card logic was: [...current, new]
                // So if new length > 2, we just take the first 2 (effectively burning the new one if appended at end, 
                // or we should alert).

                // Let's notify if we are burning
                if (team.inventory.length >= 2 && updates.inventory.length > team.inventory.length) {
                    setNotification(`Inventory Full! ${team.name} cannot hold more than 2 cards!`);
                    finalUpdates.inventory = team.inventory; // Revert to old inventory

                    // Optional: Play error sound
                    // const audio = new Audio('/sounds/error.mp3');
                    // audio.play().catch(() => {});
                }
            }

            return { ...team, ...finalUpdates };
        }));
    };

    const handleAddPlayer = (name: string) => {
        // Find smallest team
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

        // Show Modal instead of Toast for player add
        setPlayerAddedInfo({ playerName: name, teamName: targetTeam.name });
    };

    const handleActivateCard = (teamId: string, card: AdvantageCard) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        // Apply Effect
        if (card.type === 'DOUBLE_POINTS') {
            setPointsMultiplier(2);
        } else if (card.type === 'STEAL_SELECTION') {
            setActiveTeamId(teamId);
        } else if (card.type === 'RESET_REP') {
            handleUpdateTeam(teamId, { playedPlayerIds: [] });
        }

        // Remove card from inventory
        const newInventory = team.inventory.filter(c => c.id !== card.id);
        handleUpdateTeam(teamId, { inventory: newInventory });
    };

    const handleQuestionAnswered = (questionId: string) => {
        setCategories(prev => prev.map(cat => ({
            ...cat,
            questions: cat.questions.map(q =>
                q.id === questionId ? { ...q, isAnswered: true } : q
            )
        })));
    };

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
        // 1. Identify Winning Team
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0]; // Logic for ties? Assume first for now.

        // 2. Disband Winning Team -> make them Captains
        const captains = winner.players.map(p => ({ ...p })); // Clone

        // 3. Everyone else -> Drafting Pool
        const pool: Player[] = [];
        teams.forEach(t => {
            if (t.id !== winner.id) {
                pool.push(...t.players);
            }
        });

        // 4. Create new Teams for Captains
        const newTeams: Team[] = captains.map((captain) => ({
            id: `fj-team-${captain.id}`,
            name: captain.name,
            players: [captain], // Captain starts in team
            score: 0,
            playedPlayerIds: [],
            inventory: []
        }));

        // 5. Randomize Selection Order
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

        // Add player to team
        setTeams(prev => prev.map(t =>
            t.id === currentTeamId
                ? { ...t, players: [...t.players, player] }
                : t
        ));

        // Remove from pool
        const newPool = draftingPool.filter(p => p.id !== player.id);
        setDraftingPool(newPool);

        // Advance turn (Round Robin)
        const nextIndex = (currentDrafterIndex + 1) % draftingOrder.length;
        setCurrentDrafterIndex(nextIndex);

        // Check if done
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
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2342&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />

            {/* Active Effect Indicator */}
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
                        title="DANGEROUS JEOPARDY RULES"
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
                            onAddPlayerRequest={() => setIsAddPlayerModalOpen(true)}
                            pointsMultiplier={pointsMultiplier}
                            onQuestionSelected={() => setPointsMultiplier(1)}
                            onQuestionAnswered={handleQuestionAnswered}
                        />
                        {/* Dev Button to Force End Game */}
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
