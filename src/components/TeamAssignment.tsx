import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Team, Player } from '../types';
import { Sparkles } from 'lucide-react';
import { MovePlayerModal } from './MovePlayerModal';
import { TeamAssignmentCard } from './TeamAssignmentCard';

interface TeamAssignmentProps {
    teams: Team[];
    onConfirm: () => void;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
}

export function TeamAssignment({ teams, onConfirm, onUpdateTeam }: TeamAssignmentProps) {
    const [movingPlayer, setMovingPlayer] = useState<{ player: Player, teamId: string } | null>(null);

    const handleRequestMove = useCallback((player: Player, teamId: string) => {
        setMovingPlayer({ player, teamId });
    }, []);

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
                    <TeamAssignmentCard
                        key={team.id}
                        team={team}
                        index={index}
                        onUpdateTeam={onUpdateTeam}
                        onRequestMove={handleRequestMove}
                    />
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
