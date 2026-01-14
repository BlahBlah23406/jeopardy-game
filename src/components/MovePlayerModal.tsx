import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, X } from 'lucide-react';
import { Player, Team } from '../types';

interface MovePlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: Player | null;
    currentTeamId: string;
    teams: Team[];
    onMove: (targetTeamId: string) => void;
}

export function MovePlayerModal({ isOpen, onClose, player, currentTeamId, teams, onMove }: MovePlayerModalProps) {
    if (!player) return null;

    const availableTeams = teams.filter(t => t.id !== currentTeamId);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-game-surface border border-game-primary/30 p-8 rounded-2xl max-w-md w-full shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                <ArrowRightLeft className="text-game-secondary" />
                                Move Player
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-300 mb-2">
                                Moving <span className="text-game-accent font-bold">{player.name}</span> to:
                            </p>

                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {availableTeams.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => onMove(team.id)}
                                        className="w-full text-left p-4 bg-game-dark/50 hover:bg-game-primary/20 border border-gray-700 hover:border-game-primary rounded-lg transition-all group"
                                    >
                                        <div className="font-bold text-white group-hover:text-game-primary transition-colors">
                                            {team.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {team.players.length} players
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
