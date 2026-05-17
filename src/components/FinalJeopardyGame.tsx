import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Team, Question } from '../types';

interface FinalJeopardyGameProps {
    teams: Team[];
    questions: Question[];
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    onGameEnd: (winningTeamId: string) => void;
}

export function FinalJeopardyGame({ teams, questions, onUpdateTeam, onGameEnd }: FinalJeopardyGameProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [phase, setPhase] = useState<'SELECTION' | 'QUESTION' | 'REVEAL'>('SELECTION');
    // const [selectedPlayer, setSelectedPlayer] = useState<{ teamId: string, player: Player } | null>(null); // Unused
    const [answers, setAnswers] = useState<Record<string, { playerId: string, isCorrect: boolean }>>({});

    // Calculate max rounds based on team size (assuming equal teams, otherwise min size)
    // Rule: N - 1 questions. 
    // Wait, the Prompt said: "reveal as many as the one minus max amount of members on the biggest team is"
    // So if biggest team has 4 members -> 3 rounds.
    // If Tie -> Tie Breaker Question (Index 6 in our list of 7)

    // ⚡ Bolt Optimization: Memoize total rounds calculation to prevent O(N) array iteration on every render,
    // which happens frequently during the player selection phase.
    const { maxTeamSize, totalRounds } = useMemo(() => {
        const max = Math.max(...teams.map(t => t.players.length));
        return {
            maxTeamSize: max,
            totalRounds: Math.max(1, max - 1)
        };
    }, [teams]);

    // Derived state for current active question
    const currentQuestion = questions[currentQuestionIndex];
    // const isTieBreaker = currentQuestionIndex >= totalRounds; // Unused

    // Actually, simple flow:
    // Round 1 -> Index 0. 
    // ...
    // Round N-1 -> Index N-2.
    // If Tie at end -> Index 6 (The Tie Breaker Question).

    // Let's refine the question flow logic.
    // We only show questions up to totalRounds.

    // "we will do one at a time, and the cpatain will select who will go, and then once one final jeopardy question is done, the next will be shown"
    // This implies ALL teams answer the SAME question.

    const [teamSelections, setTeamSelections] = useState<Record<string, string>>({}); // valid player IDs per team

    // Check if all teams have selected a player
    const allTeamsSelected = teams.every(t => teamSelections[t.id]);

    const handlePlayerSelect = (teamId: string, playerId: string) => {
        setTeamSelections(prev => ({ ...prev, [teamId]: playerId }));
    };

    const handleConfirmSelections = () => {
        setPhase('QUESTION');
    };

    const handleReveal = () => {
        setPhase('REVEAL');
    };

    const handleScore = (teamId: string, isCorrect: boolean) => {
        // Just local state or update real team score?
        // Let's update real team score
        if (isCorrect) {
            const team = teams.find(t => t.id === teamId);
            if (team) {
                // Check if this player already played?
                // Logic says we enforce selection, so here we assume selection was valid.
                // We need to mark player as played.
                const playerId = teamSelections[teamId];

                // Update Score & Played status
                onUpdateTeam(teamId, {
                    score: team.score + currentQuestion.points,
                    playedPlayerIds: [...team.playedPlayerIds, playerId]
                });
            }
        } else {
            const team = teams.find(t => t.id === teamId);
            if (team) {
                const playerId = teamSelections[teamId];
                // Still mark as played even if wrong? Usually yes.
                onUpdateTeam(teamId, {
                    playedPlayerIds: [...team.playedPlayerIds, playerId]
                });
            }
        }

        // Track locally to disable buttons
        setAnswers(prev => ({ ...prev, [teamId]: { playerId: teamSelections[teamId], isCorrect } }));
    };

    // Check if scoring is done for all
    // const allScored = teams.every(t => answers[t.id] !== undefined); // Only if we track per round in `answers`
    // We need to clear `answers` and `teamSelections` per round.

    const handleNext = () => {
        // Check for Game End
        const isEnd = currentQuestionIndex + 1 >= totalRounds;

        if (isEnd) {
            // Check for Tie
            const highestScore = Math.max(...teams.map(t => t.score));
            const winners = teams.filter(t => t.score === highestScore);

            if (winners.length > 1) {
                // Trigger Tie Breaker
                // Jump to the Tie Breaker Question (Last one)
                setCurrentQuestionIndex(questions.length - 1);
                resetRound();
            } else {
                onGameEnd(winners[0].id);
            }
        } else {
            // Is this the Tie breaker we just finished?
            if (currentQuestionIndex === questions.length - 1) {
                // Find winner again
                const highestScore = Math.max(...teams.map(t => t.score));
                const winners = teams.filter(t => t.score === highestScore);
                onGameEnd(winners[0].id); // Even if tie again, just pick one? Or Random?
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
                resetRound();
            }
        }
    };

    const resetRound = () => {
        setTeamSelections({});
        setAnswers({});
        setPhase('SELECTION');
    };


    return (
        <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-4 gap-6">

            {/* Top Bar: Question Info & Scores */}
            <div className="flex justify-between items-center bg-blue-900/50 p-4 rounded-xl border border-blue-500/30">
                <div className="text-xl font-bold text-blue-300">
                    {currentQuestionIndex === questions.length - 1 ? 'TIE BREAKER' : `Question ${currentQuestionIndex + 1} of ${totalRounds}`}
                </div>
                <div className="flex gap-4">
                    {teams.map(t => (
                        <div key={t.id} className="flex flex-col items-center">
                            <span className="text-xs text-gray-400">{t.name}</span>
                            <span className="font-mono font-bold text-xl">{t.score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* PHASE: SELECTION */}
                {phase === 'SELECTION' && (
                    <div className="w-full flex flex-col gap-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Captains, select your champion!</h2>
                            <p className="text-gray-400">Choose a team member who hasn't played yet.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {teams.map(team => (
                                <div key={team.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col gap-3 flex-1 min-w-[200px] max-w-[250px]">
                                    <h3 className="font-bold text-center border-b border-gray-600 pb-2">{team.name}</h3>
                                    <div className="flex flex-col gap-2">
                                        {team.players.map(player => {
                                            const isCaptain = team.players[0].id === player.id; // Captain is first
                                            const hasPlayed = team.playedPlayerIds.includes(player.id);

                                            // Logic:
                                            // 1. Captain CANNOT play (unless tie-breaker? "tie-breaker question and that wont have any player rep limitatation")
                                            // 2. Others can play if they haven't played yet.
                                            // 3. IF all eligible members (non-captains) have played, then reset (allow picking anyone again).

                                            const eligibleMembers = team.players.filter(p => p.id !== team.players[0].id);
                                            const playedEligible = eligibleMembers.filter(p => team.playedPlayerIds.includes(p.id));
                                            const allEligiblePlayed = playedEligible.length >= eligibleMembers.length;

                                            // Tie breaker involves everyone.
                                            const isTieBreakerRound = currentQuestionIndex === questions.length - 1;
                                            const isSoloCaptainTeam = team.players.length === 1;

                                            let isSelectable = false;

                                            if (isTieBreakerRound) {
                                                isSelectable = true; // No limits
                                            } else {
                                                if (isSoloCaptainTeam) {
                                                    isSelectable = true; // Solo captain plays all rounds
                                                } else if (isCaptain) {
                                                    isSelectable = false; // Captain never plays in normal rounds
                                                } else {
                                                    // Allow if not played OR if all have played (reset condition)
                                                    // But wait, if all have played, we allow re-selection.
                                                    // Does selecting adding to playedPlayerIds block them again?
                                                    // `hasPlayed` will be true. `allEligiblePlayed` will be true.
                                                    // So `(!hasPlayed || allEligiblePlayed)` works.
                                                    isSelectable = !hasPlayed || allEligiblePlayed;
                                                }
                                            }

                                            const isSelected = teamSelections[team.id] === player.id;

                                            return (
                                                <button
                                                    key={player.id}
                                                    disabled={!isSelectable}
                                                    onClick={() => handlePlayerSelect(team.id, player.id)}
                                                    className={`
                                                         p-2 rounded text-sm text-center transition-all
                                                         ${isSelected ? 'bg-yellow-500 text-black font-bold ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'}
                                                         ${!isSelectable ? 'opacity-30 cursor-not-allowed' : ''}
                                                     `}
                                                >
                                                    {player.name} {isCaptain ? '(C)' : ''}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <button
                                disabled={!allTeamsSelected}
                                onClick={handleConfirmSelections}
                                className="px-8 py-4 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-500 transition-all"
                            >
                                Start Question
                            </button>
                        </div>
                    </div>
                )}

                {/* PHASE: QUESTION & REVEAL */}
                {(phase === 'QUESTION' || phase === 'REVEAL') && (
                    <div className="w-full max-w-4xl flex flex-col gap-8 text-center animate-in fade-in zoom-in duration-500">
                        {/* Question Card */}
                        <div className="bg-blue-800 p-12 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.6)] border-4 border-yellow-400">
                            <h3 className="text-yellow-400 font-black tracking-widest text-lg mb-6 uppercase">
                                For {currentQuestion.points} Points
                            </h3>
                            <div className="text-4xl md:text-5xl font-serif leading-relaxed min-h-[200px] flex items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {currentQuestion.text}
                                </motion.div>
                            </div>

                            {phase === 'REVEAL' && (
                                <div className="mt-8 pt-8 border-t border-blue-600 animate-in slide-in-from-bottom duration-700">
                                    <div className="text-xl text-blue-300 uppercase tracking-widest mb-2">Answer</div>
                                    <div className="text-4xl font-black text-white">{currentQuestion.answer}</div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        {phase === 'QUESTION' ? (
                            <button
                                onClick={handleReveal}
                                className="mx-auto px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg border border-gray-500"
                            >
                                Reveal Answer
                            </button>
                        ) : (
                            <div className="bg-gray-900/90 p-6 rounded-xl border border-gray-700 backdrop-blur">
                                <h4 className="text-gray-400 uppercase tracking-widest mb-4">Scoring</h4>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {teams.map(team => {
                                        const playerId = teamSelections[team.id];
                                        const player = team.players.find(p => p.id === playerId);
                                        const hasScored = answers[team.id];

                                        if (hasScored) {
                                            return (
                                                <div key={team.id} className={`p-4 rounded-lg font-bold ${answers[team.id].isCorrect ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                    {answers[team.id].isCorrect ? '+ Points' : 'Missed'}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={team.id} className="flex flex-col gap-2 p-3 bg-gray-800 rounded border border-gray-700 flex-1 min-w-[150px] max-w-[200px]">
                                                <div className="text-xs text-gray-500 truncate">{team.name}</div>
                                                <div className="font-bold truncate">{player?.name}</div>
                                                <div className="flex gap-2 justify-center mt-2">
                                                    <button onClick={() => handleScore(team.id, true)} className="p-2 bg-green-600 hover:bg-green-500 rounded text-xs px-3">
                                                        ✓
                                                    </button>
                                                    <button onClick={() => handleScore(team.id, false)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-xs px-3">
                                                        ✗
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {Object.keys(answers).length === teams.length && (
                                    <button
                                        onClick={handleNext}
                                        className="mt-6 px-10 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-full shadow-lg"
                                    >
                                        Next Question
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

