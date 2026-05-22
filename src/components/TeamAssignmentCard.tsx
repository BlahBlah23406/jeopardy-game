import { memo } from 'react';
import { motion } from 'framer-motion';
import { Team, Player } from '../types';
import { Shield, ArrowRightLeft } from 'lucide-react';

interface TeamAssignmentCardProps {
    team: Team;
    index: number;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    onMovePlayerRequest: (player: Player, teamId: string) => void;
}

export const TeamAssignmentCard = memo(({ team, index, onUpdateTeam, onMovePlayerRequest }: TeamAssignmentCardProps) => {
    return (
        <motion.div
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
                            onClick={() => onMovePlayerRequest(player, team.id)}
                            className="opacity-0 group-hover/player:opacity-100 p-1 hover:bg-game-primary/20 rounded text-gray-400 hover:text-game-accent transition-all"
                            title="Move Player"
                        >
                            <ArrowRightLeft size={14} />
                        </button>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
});
TeamAssignmentCard.displayName = 'TeamAssignmentCard';
