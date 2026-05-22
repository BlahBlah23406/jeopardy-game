import { useState } from 'react';
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
    const [answers, setAnswers] = useState<Record<string, { playerId: string, isCorrect: boolean }>>({});

    const maxTeamSize = Math.max(...teams.map(t => t.players.length));
    const totalRounds = Math.max(1, maxTeamSize - 1);
    const currentQuestion = questions[currentQuestionIndex];

    const [teamSelections, setTeamSelections] = useState<Record<string, string>>({});

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
        const team = teams.find(t => t.id === teamId);
        if (team) {
            const playerId = teamSelections[teamId];
            onUpdateTeam(teamId, {
                score: isCorrect ? team.score + currentQuestion.points : team.score,
                playedPlayerIds: [...team.playedPlayerIds, playerId]
            });
        }

        setAnswers(prev => ({ ...prev, [teamId]: { playerId: teamSelections[teamId], isCorrect } }));
    };

    const handleNext = () => {
        const isEnd = currentQuestionIndex + 1 >= totalRounds;

        if (isEnd) {
            const highestScore = Math.max(...teams.map(t => t.score));
            const winners = teams.filter(t => t.score === highestScore);

            if (winners.length > 1) {
                setCurrentQuestionIndex(questions.length - 1);
                resetRound();
            } else {
                onGameEnd(winners[0].id);
            }
        } else {
            if (currentQuestionIndex === questions.length - 1) {
                const highestScore = Math.max(...teams.map(t => t.score));
                const winners = teams.filter(t => t.score === highestScore);
                onGameEnd(winners[0].id);
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
                                            const isCaptain = team.players[0].id === player.id;
                                            const hasPlayed = team.playedPlayerIds.includes(player.id);

                                            const eligibleMembers = team.players.filter(p => p.id !== team.players[0].id);
                                            const playedEligible = eligibleMembers.filter(p => team.playedPlayerIds.includes(p.id));
                                            const allEligiblePlayed = playedEligible.length >= eligibleMembers.length;

                                            const isTieBreakerRound = currentQuestionIndex === questions.length - 1;
                                            const isSoloCaptainTeam = team.players.length === 1;

                                            let isSelectable = false;

                                            if (isTieBreakerRound) {
                                                isSelectable = true;
                                            } else {
                                                if (isSoloCaptainTeam) {
                                                    isSelectable = true;
                                                } else if (isCaptain) {
                                                    isSelectable = false;
                                                } else {
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

