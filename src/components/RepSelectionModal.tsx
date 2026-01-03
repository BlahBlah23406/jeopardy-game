import { motion } from 'framer-motion';
import { Player, Team } from '../types';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface RepSelectionModalProps {
    teams: Team[];
    onConfirm: (data: { [teamId: string]: string }) => void;
    // Optional: allow cancelling (e.g. going back to board without picking)
    onCancel?: () => void;
}

export function RepSelectionModal({ teams, onConfirm }: RepSelectionModalProps) {
    // Local state to track selected player ID for each team
    const [selections, setSelections] = useState<{ [teamId: string]: string }>({});

    // Helper to determine available players for a specific team
    const getAvailablePlayers = (team: Team): Player[] => {
        // If everyone has played, reset is implied for this turn (all available)
        // OR we can explicitly handle the reset logic in the confirm handler.
        // For UI: if playedPlayerIds.length === players.length, show all players BUT
        // conceptually this means a new cycle starts.

        // Simpler logic: Logic will be enforced here.
        // If all players have played, they are ALL available selection candidates again.
        const allPlayed = team.playedPlayerIds.length === team.players.length;

        if (allPlayed) {
            return team.players;
        }

        return team.players.filter(p => !team.playedPlayerIds.includes(p.id));
    };

    const handleSelect = (teamId: string, playerId: string) => {
        setSelections(prev => ({
            ...prev,
            [teamId]: playerId
        }));
    };

    // Check if a selection has been made for EVERY team
    const allTeamsSelected = teams.every(team => selections[team.id]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-8"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-6xl flex flex-col gap-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest">
                        Identify Representatives
                    </h2>
                    <p className="text-gray-400">Select one member from each team to step forward.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {teams.map(team => {
                        const available = getAvailablePlayers(team);
                        const selectedId = selections[team.id];

                        return (
                            <div
                                key={team.id}
                                className="flex-1 min-w-[280px] max-w-[320px] bg-game-surface/50 border border-white/10 rounded-xl p-4 flex flex-col gap-4 shadow-xl"
                            >
                                <div className="text-center font-bold text-xl text-white border-b border-white/10 pb-2">
                                    {team.name}
                                </div>

                                <div className="flex flex-col gap-3 flex-1">
                                    {available.map(player => (
                                        <button
                                            key={player.id}
                                            onClick={() => handleSelect(team.id, player.id)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg transition-all border",
                                                selectedId === player.id
                                                    ? "bg-game-primary text-white border-game-accent shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-[1.02]"
                                                    : "bg-white/5 text-gray-300 border-transparent hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="font-semibold">{player.name}</div>
                                        </button>
                                    ))}

                                    {available.length === 0 && (
                                        // This safety case shouldn't happen with our logic, but fallback
                                        <div className="text-sm text-red-400 text-center italic">
                                            No eligible players?
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        disabled={!allTeamsSelected}
                        onClick={() => allTeamsSelected && onConfirm(selections)}
                        className={cn(
                            "px-12 py-4 rounded-full font-bold text-xl uppercase tracking-widest transition-all shadow-xl",
                            allTeamsSelected
                                ? "bg-game-accent text-game-dark hover:scale-105 hover:bg-yellow-300 shadow-yellow-500/20"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        Reveal Question
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
