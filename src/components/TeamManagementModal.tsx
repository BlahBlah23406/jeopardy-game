
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Player, Team } from '../types';
import { X, Trash2, Save, Minus, Plus, ArrowRightLeft } from 'lucide-react';
import { MovePlayerModal } from './MovePlayerModal';

interface TeamManagementModalProps {
    team: Team;
    teams: Team[];
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    onClose: () => void;
}

export function TeamManagementModal({ team, teams, onUpdateTeam, onClose }: TeamManagementModalProps) {
    const [score, setScore] = useState(team.score);
    const [name, setName] = useState(team.name);
    const [movingPlayer, setMovingPlayer] = useState<Player | null>(null);

    const handleSave = () => {
        onUpdateTeam(team.id, { score, name });
        onClose();
    };

    const handleRemovePlayer = (playerId: string) => {
        const updatedPlayers = team.players.filter(p => p.id !== playerId);
        const updatedPlayedIds = team.playedPlayerIds.filter(id => id !== playerId);

        onUpdateTeam(team.id, {
            players: updatedPlayers,
            playedPlayerIds: updatedPlayedIds
        });
    };

    const handleMovePlayer = (targetTeamId: string) => {
        if (!movingPlayer) return;

        const targetTeam = teams.find(t => t.id === targetTeamId);

        if (targetTeam) {
            // Remove from current (this modal's team)
            handleRemovePlayer(movingPlayer.id);

            // Add to target
            onUpdateTeam(targetTeamId, {
                players: [...targetTeam.players, movingPlayer]
            });
        }

        setMovingPlayer(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-game-surface border border-game-primary rounded-xl w-full max-w-md p-6 shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-game-primary">Manage Team</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Team Name */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Team Name</label>
                        <input
                            type="text"
                            maxLength={10}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white focus:border-game-accent focus:outline-none"
                        />
                    </div>

                    {/* Score Control */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Current Score</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setScore(s => s - 100)}
                                aria-label="Decrease score by 100"
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                className="flex-1 bg-black/30 border border-gray-600 rounded p-2 text-center text-xl font-mono text-game-accent focus:border-game-accent focus:outline-none"
                            />
                            <button
                                onClick={() => setScore(s => s + 100)}
                                aria-label="Increase score by 100"
                                className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Roster Management */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Roster ({team.players.length})</label>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {team.players.map(player => (
                                <div key={player.id} className="flex justify-between items-center bg-black/20 p-2 rounded hover:bg-black/40 transition-colors group">
                                    <span className="text-white">{player.name}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => setMovingPlayer(player)}
                                            aria-label={`Move player ${player.name}`}
                                            className="text-gray-400 hover:text-game-accent p-1"
                                            title="Move Player"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemovePlayer(player.id)}
                                            aria-label={`Remove player ${player.name}`}
                                            className="text-gray-400 hover:text-red-400 p-1"
                                            title="Remove Player"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {team.players.length === 0 && (
                                <div className="text-gray-500 text-center text-sm py-4 italic">No players remaining</div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-game-primary hover:bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>

                <MovePlayerModal
                    isOpen={!!movingPlayer}
                    onClose={() => setMovingPlayer(null)}
                    player={movingPlayer}
                    currentTeamId={team.id}
                    teams={teams}
                    onMove={handleMovePlayer}
                />
            </motion.div>
        </div>
    );
}
