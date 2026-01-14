
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Team, Player } from '../types';
import { Shield, Sparkles, ArrowRightLeft } from 'lucide-react';
import { MovePlayerModal } from './MovePlayerModal';

interface TeamAssignmentProps {
    teams: Team[];
    onConfirm: () => void;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
}

export function TeamAssignment({ teams, onConfirm, onUpdateTeam }: TeamAssignmentProps) {
    const [movingPlayer, setMovingPlayer] = useState<{ player: Player, teamId: string } | null>(null);

    const handleMovePlayer = (targetTeamId: string) => {
        if (!movingPlayer) return;

        const { player, teamId: sourceTeamId } = movingPlayer;
        const sourceTeam = teams.find(t => t.id === sourceTeamId);
        const targetTeam = teams.find(t => t.id === targetTeamId);

        if (sourceTeam && targetTeam) {
            // Remove from source
            onUpdateTeam(sourceTeamId, {
                players: sourceTeam.players.filter(p => p.id !== player.id)
            });

            // Add to target
            onUpdateTeam(targetTeamId, {
                players: [...targetTeam.players, player]
            });
        }

        setMovingPlayer(null);
    };

    return (
        <div className="w-full max-w-6xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-game-accent to-yellow-300 bg-clip-text text-transparent">
                    Team Assignments
                </h1>
                <p className="text-gray-400 text-lg">Customize your team names and prepare for battle...</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-game-surface border border-gray-700 rounded-xl p-6 relative overflow-visible group hover:border-game-primary/50 transition-colors flex-1 min-w-[280px] max-w-[320px]"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Shield className="w-24 h-24" />
                        </div>

                        <div className="mb-4 relative z-20">
                            <label className="text-xs text-game-primary uppercase tracking-wider font-bold mb-1 block">
                                Team Name
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                value={team.name}
                                onChange={(e) => onUpdateTeam(team.id, { name: e.target.value })}
                                className="w-full bg-black/30 border border-game-primary/30 rounded px-2 py-1 text-xl font-bold text-game-primary focus:outline-none focus:border-game-accent text-center"
                                placeholder="Team Name"
                            />
                            <div className="text-[10px] text-right text-gray-500 mt-1">
                                {team.name.length}/10
                            </div>
                        </div>

                        <ul className="space-y-2 relative z-10">
                            {team.players.map(player => (
                                <li key={player.id} className="text-gray-300 flex items-center justify-between gap-2 group/player p-1 rounded hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-game-accent rounded-full" />
                                        {player.name}
                                    </div>
                                    <button
                                        onClick={() => setMovingPlayer({ player, teamId: team.id })}
                                        className="opacity-0 group-hover/player:opacity-100 p-1 hover:bg-game-primary/20 rounded text-gray-400 hover:text-game-accent transition-all"
                                        title="Move Player"
                                    >
                                        <ArrowRightLeft size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex justify-center"
            >
                <button
                    onClick={onConfirm}
                    className="px-8 py-4 bg-game-accent hover:bg-yellow-400 text-game-dark font-bold text-xl rounded-xl shadow-lg shadow-yellow-500/20 transform transition-all hover:scale-105 flex items-center gap-2"
                >
                    <Sparkles className="w-6 h-6" />
                    Enter the Arena
                </button>
            </motion.div>

            <MovePlayerModal
                isOpen={!!movingPlayer}
                onClose={() => setMovingPlayer(null)}
                player={movingPlayer?.player || null}
                currentTeamId={movingPlayer?.teamId || ''}
                teams={teams}
                onMove={handleMovePlayer}
            />
        </div>
    );
}
