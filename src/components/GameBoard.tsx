import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RepSelectionModal } from './RepSelectionModal';
import { RevealModal } from './RevealModal';
import { Team, Category, Question } from '../types';
import { cn } from '../lib/utils';
import { X, Trophy, UserPlus, Info, Eye, CheckCircle2 } from 'lucide-react';
import { verifyAnswerWithAI } from '../lib/gemini';

interface GameBoardProps {
    categories: Category[];
    teams: Team[];
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    onSetActiveTeam: (teamId: string) => void;
    onAddPlayerRequest: () => void;
    pointsMultiplier: number;
    onQuestionSelected: () => void;
    onQuestionAnswered: (questionId: string) => void;
}

const createAdvantageCard = (type: import('../types').AdvantageCardType): import('../types').AdvantageCard => {
    const base = { id: Math.random().toString(36).substr(2, 9), type };
    switch (type) {
        case 'DOUBLE_POINTS': return { ...base, name: 'Double Points', description: 'Double the points of the next selected question.' };
        case 'STEAL_SELECTION': return { ...base, name: 'Steal Turn', description: 'Steal the ability to select the next question.' };
        case 'RESET_REP': return { ...base, name: 'Reset Roster', description: 'Reset the "played players" rotation.' };
    }
};

function QuestionModalContent({ question, teams, onClose, onScore, onNoScore }: {
    question: Question;
    teams: Team[];
    onClose: () => void;
    onScore: (teamId: string) => void;
    onNoScore: () => void;
}) {
    const [isReading, setIsReading] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [rememberKey, setRememberKey] = useState(true);
    const [verificationResult, setVerificationResult] = useState<{ isCorrect: boolean, explanation: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Load saved API key on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('jeopardy-gemini-key');
        if (savedKey) {
            setApiKey(savedKey);
            setRememberKey(true);
        }
    }, []);

    const handleVerifySubmit = async () => {
        if (!userAnswer.trim() || !apiKey.trim()) return;

        setIsVerifying(true);
        setVerifyError(null);
        setVerificationResult(null);
        setShowExplanation(false);

        if (rememberKey) {
            localStorage.setItem('jeopardy-gemini-key', apiKey.trim());
        } else {
            localStorage.removeItem('jeopardy-gemini-key');
        }

        try {
            const result = await verifyAnswerWithAI(question.text, question.answer, userAnswer, apiKey.trim());
            setVerificationResult(result);
        } catch (err: any) {
            setVerifyError(err.message || "Failed to verify answer.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Effect to handle reading
    useEffect(() => {
        // Cancel any previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(question.text);
        // Prevent garbage collection by keeping a reference
        (window as any)._currentGameUtterance = utterance;

        utterance.rate = 1.0; // Normal rate
        utterance.onend = () => {
            setIsReading(false);
        };
        utterance.onerror = () => {
            setIsReading(false); // In case of error, show text
        };

        // Chrome/Safari sometimes need a slight delay after cancel
        setTimeout(() => {
            // Also resume in case speech synthesis was paused globally
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        }, 50);

        // Cleanup on unmount or close
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [question.text]);

    const handleSkip = () => {
        setIsReading(false);
    };

    return (
        <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-game-surface w-full max-w-4xl aspect-video rounded-3xl border-2 border-game-primary shadow-2xl p-12 flex flex-col items-center justify-center relative"
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <X className="w-8 h-8 text-gray-400 hover:text-white" />
            </button>

            <div className="text-game-accent font-bold text-xl uppercase tracking-widest mb-8">
                For {question.points} Points
            </div>

            {isReading ? (
                <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-4 h-4 bg-game-accent rounded-full"
                            />
                        ))}
                    </div>
                    <p className="text-2xl text-game-accent/80 font-mono animate-pulse">
                        Reading Question...
                    </p>
                    <button
                        onClick={handleSkip}
                        className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold tracking-wider transition-colors border border-white/20"
                    >
                        REVEAL NOW
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl text-center font-bold leading-tight"
                    >
                        {question.text}
                    </motion.h2>

                    {/* Extra Actions Row */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-bold transition-all"
                        >
                            <Info className="w-4 h-4" />
                            {showInfo ? 'Hide Info' : 'More Info'}
                        </button>
                        <button
                            onClick={() => {
                                setShowVerify(!showVerify);
                                setShowAnswer(false);
                                setShowInfo(false);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                showVerify ? "bg-purple-600 text-white" : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {showVerify ? 'Close Verify' : 'Verify Answer'}
                        </button>
                        <button
                            onClick={() => {
                                setShowAnswer(!showAnswer);
                                setShowVerify(false);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                showAnswer ? "bg-green-600 text-white" : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                            )}
                        >
                            <Eye className="w-4 h-4" />
                            {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                        </button>
                    </div>

                    {/* Revealed Content Areas */}
                    <AnimatePresence>
                        {showInfo && question.moreInfo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-blue-200 text-center"
                            >
                                {question.moreInfo}
                            </motion.div>
                        )}
                        {showAnswer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full bg-green-900/20 border border-green-500/30 p-4 rounded-lg text-green-200 text-2xl font-bold text-center"
                            >
                                {question.answer}
                            </motion.div>
                        )}
                        {showVerify && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full bg-gray-900 border border-purple-500/50 p-6 rounded-xl text-left"
                            >
                                <h3 className="text-purple-300 font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> AI Verify
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            placeholder="Type the player's answer here..."
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                            disabled={isVerifying}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder="Gemini API Key"
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                disabled={isVerifying}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                id="remember-key-verify"
                                                checked={rememberKey}
                                                onChange={(e) => setRememberKey(e.target.checked)}
                                                className="rounded bg-gray-700"
                                                disabled={isVerifying}
                                            />
                                            <label htmlFor="remember-key-verify" className="text-xs text-gray-400">Remember Key</label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleVerifySubmit}
                                        disabled={isVerifying || !userAnswer.trim() || !apiKey.trim()}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Submit to AI Judge'}
                                    </button>

                                    {verifyError && (
                                        <div className="text-red-400 text-sm mt-2">{verifyError}</div>
                                    )}

                                    {verificationResult && (
                                        <div className={cn(
                                            "mt-4 p-4 rounded-lg border",
                                            verificationResult.isCorrect ? "bg-green-900/30 border-green-500/50" : "bg-red-900/30 border-red-500/50"
                                        )}>
                                            <div className={cn(
                                                "font-black text-xl flex items-center justify-between",
                                                verificationResult.isCorrect ? "text-green-400" : "text-red-400"
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    {verificationResult.isCorrect ? <><CheckCircle2 className="w-6 h-6" /> CORRECT</> : <><X className="w-6 h-6" /> INCORRECT</>}
                                                </div>
                                                <button
                                                    onClick={() => setShowExplanation(!showExplanation)}
                                                    className="text-xs px-3 py-1 bg-black/20 hover:bg-black/40 rounded-full transition-colors font-bold uppercase text-white/70"
                                                >
                                                    {showExplanation ? 'Hide Explanation' : 'Why?'}
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {showExplanation && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="text-gray-300 text-sm mt-3 pt-3 border-t border-white/10">
                                                            {verificationResult.explanation}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div className="mt-8 opacity-50 text-sm mb-4">
                {isReading ? 'Listen closely...' : 'Click a team below to award points and give them control.'}
            </div>

            {/* Team Scoring Buttons - Only visible when revealed */}
            <div className={cn(
                "flex flex-wrap justify-center gap-4 w-full transition-all duration-500",
                isReading ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"
            )}>
                {teams.map(team => (
                    <button
                        key={team.id}
                        onClick={() => onScore(team.id)}
                        disabled={isReading}
                        className="bg-game-surface hover:bg-game-primary border border-game-accent/30 hover:border-game-accent rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 group flex-1 min-w-[150px] max-w-[220px]"
                    >
                        <div className="font-bold text-white group-hover:text-yellow-300">
                            {team.name}
                        </div>
                        <div className="text-sm text-game-accent flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>+{question.points}</span>
                        </div>
                    </button>
                ))}

                {/* No Points Option */}
                <button
                    onClick={onNoScore}
                    className="bg-gray-800/50 hover:bg-gray-700/80 border border-gray-600 hover:border-gray-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 flex-1 min-w-[150px] max-w-[220px]"
                >
                    <div className="font-bold text-gray-400">No Winner</div>
                    <div className="text-sm text-gray-500">Discard Question</div>
                </button>
            </div>
        </motion.div>
    );
}

// Memoized Column Component
const CategoryColumn = memo(({ category, onQuestionClick, isCategoryRevealed }: {
    category: Category,
    onQuestionClick: (q: Question) => void,
    isCategoryRevealed: boolean
}) => {
    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="bg-game-primary/80 text-center py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center h-24 border border-blue-400/30">
                <span className="line-clamp-2 px-2 uppercase tracking-wider text-shadow transition-all duration-500">
                    {isCategoryRevealed ? category.title : "???"}
                </span>
            </div>

            {/* Questions */}
            <div className="flex-1 flex flex-col gap-4">
                {category.questions.map((q) => (
                    <motion.button
                        key={q.id}
                        onClick={() => onQuestionClick(q)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "flex-1 rounded-lg font-bold text-2xl shadow-md transition-all flex items-center justify-center relative overflow-hidden",
                            q.isAnswered
                                ? "bg-gray-900/80 text-gray-600 border border-gray-800"
                                : "bg-game-surface text-game-accent hover:bg-game-surface/80 hover:text-yellow-300 border border-game-accent/20 hover:border-game-accent"
                        )}
                    >
                        {/* HIDDEN Revealed Indicators - Only show when answered (history) */}
                        {q.isDoubleJeopardy && q.isAnswered && (
                            <div className="absolute top-1 right-1 text-[8px] uppercase tracking-widest font-black text-yellow-300 opacity-70">
                                2x
                            </div>
                        )}

                        {/* Show Advantage indicator only after answered */}
                        {q.rewardCard && q.isAnswered && (
                            <div className="absolute top-1 left-1 text-[8px] uppercase tracking-widest font-black text-blue-300 opacity-70">
                                ★
                            </div>
                        )}

                        <span className={cn(q.isAnswered ? "opacity-30 text-gray-500" : "")}>
                            {q.points}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
});
CategoryColumn.displayName = "CategoryColumn";

export function GameBoard({ categories, teams, onUpdateTeam, onSetActiveTeam, onAddPlayerRequest, pointsMultiplier, onQuestionSelected, onQuestionAnswered }: GameBoardProps) {
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [pendingQuestion, setPendingQuestion] = useState<Question | null>(null);
    const [isSelectingRep, setIsSelectingRep] = useState(false);
    const [revealType, setRevealType] = useState<'DOUBLE_JEOPARDY' | import('../types').AdvantageCardType | null>(null);

    // Removed handleAddPlayer

    const handleQuestionClick = useCallback((q: Question) => {
        if (!q.isAnswered) {
            // Calculate Points Logic
            let points = q.points;
            if (q.isDoubleJeopardy) points *= 2;
            points *= pointsMultiplier;

            const effectiveQuestion = { ...q, points };

            setPendingQuestion(effectiveQuestion);

            // Check for hidden reveals
            if (q.isDoubleJeopardy) {
                setRevealType('DOUBLE_JEOPARDY');
            } else if (q.rewardCard) {
                setRevealType(q.rewardCard);
            } else {
                // Normal flow
                setIsSelectingRep(true);
            }

            // Play Sound / TTS
            if (q.isDoubleJeopardy) {
                const audio = new Audio('/sounds/double-jeopardy.mp3');
                audio.play().catch(() => {
                    // Fallback to TTS
                    const u = new SpeechSynthesisUtterance("Double Jeopardy!");
                    u.rate = 1.2;
                    u.pitch = 1.2;
                    window.speechSynthesis.speak(u);
                });
            } else if (q.rewardCard) {
                const audio = new Audio('/sounds/advantage.mp3');
                audio.play().catch(() => {
                    // Fallback to TTS
                    const u = new SpeechSynthesisUtterance("Advantage Card!");
                    window.speechSynthesis.speak(u);
                });
            }

            onQuestionSelected(); // Notify parent to reset multiplier
        }
    }, [pointsMultiplier, onQuestionSelected]);

    const handleRevealClose = () => {
        setRevealType(null);
        setIsSelectingRep(true); // Proceed to selection after reveal
    };

    const handleRepSelectionConfirm = (selections: { [teamId: string]: string }) => {
        // Update each team with their assigned rep
        Object.entries(selections).forEach(([teamId, playerId]) => {
            const team = teams.find(t => t.id === teamId);
            if (team) {
                // Logic: If list was full, reset it, then add new one? 
                // Our modal logic handles the "reset" display, but persistent state needs clear logic.
                // Simplified: Just APPEND. If it becomes length+1, we might need cleanup elsewhere or just rely on length check.
                // Actually, the modal logic `getAvailablePlayers` checked `length === length`.
                // So if we just append, the list grows forever? NO.
                // We should clear the list if it was full, then add.

                let newPlayedIds = [...team.playedPlayerIds];
                if (newPlayedIds.length >= team.players.length) {
                    newPlayedIds = []; // Reset cycle
                }
                newPlayedIds.push(playerId);

                onUpdateTeam(teamId, { playedPlayerIds: newPlayedIds });
            }
        });

        setActiveQuestion(pendingQuestion);
        setPendingQuestion(null);
        setIsSelectingRep(false);
    };

    const handleTeamScore = (teamId: string) => {
        if (!activeQuestion) return;

        const team = teams.find(t => t.id === teamId);
        if (team) {
            const updates: Partial<Team> = { score: team.score + activeQuestion.points };

            // Check for reward card
            if (activeQuestion.rewardCard) {
                const newCard = createAdvantageCard(activeQuestion.rewardCard);
                updates.inventory = [...(team.inventory || []), newCard];
                // Should we show a notification? For now, the inventory update is visible in scoreboard.
            }

            onUpdateTeam(teamId, updates);
            onSetActiveTeam(teamId);
            onQuestionAnswered(activeQuestion.id);
        }
        setActiveQuestion(null);
    };

    const handleNoScore = () => {
        if (!activeQuestion) return;
        onQuestionAnswered(activeQuestion.id);
        setActiveQuestion(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col h-[65vh] relative mb-48 mt-16">
            {/* Header / Controls */}
            <div className="absolute -top-16 right-4 z-20">
                <button
                    onClick={onAddPlayerRequest}
                    className="flex items-center justify-center w-10 h-10 bg-game-accent/20 hover:bg-game-accent text-game-accent hover:text-game-dark border border-game-accent rounded-full transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:scale-110"
                    title="Add Player"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-6 gap-4 h-full">
                {categories.map((category) => {
                    // Check if category should be revealed
                    const isRevealed = category.questions.some(q => q.isAnswered) || (activeQuestion?.id.startsWith(category.id));

                    return (
                        <CategoryColumn
                            key={category.id}
                            category={category}
                            onQuestionClick={handleQuestionClick}
                            isCategoryRevealed={!!isRevealed}
                        />
                    );
                })}
            </div>

            {/* Question Modal */}
            <AnimatePresence>
                {activeQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
                    >
                        <QuestionModalContent
                            question={activeQuestion}
                            teams={teams}
                            onClose={() => setActiveQuestion(null)}
                            onScore={handleTeamScore}
                            onNoScore={handleNoScore}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {isSelectingRep && (
                    <RepSelectionModal
                        teams={teams}
                        onConfirm={handleRepSelectionConfirm}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {revealType && (
                    <RevealModal
                        type={revealType}
                        onClose={handleRevealClose}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
