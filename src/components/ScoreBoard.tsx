
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, AdvantageCard } from '../types';
import { Trophy, Shield, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { TeamManagementModal } from './TeamManagementModal';
import { InventoryDisplay } from './InventoryDisplay';

interface ScoreBoardProps {
    teams: Team[];
    activeTeamId: string | null;
    onSetActiveTeam: (teamId: string) => void;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    onActivateCard: (teamId: string, card: AdvantageCard) => void;
}

export function ScoreBoard({ teams, activeTeamId, onSetActiveTeam, onUpdateTeam, onActivateCard }: ScoreBoardProps) {
    const [managingTeamId, setManagingTeamId] = useState<string | null>(null);

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 h-40 bg-game-dark/95 backdrop-blur-md border-t border-game-primary/30 flex items-end justify-center gap-6 pb-2 px-8 z-40 transition-all">
                {teams.map((team) => {
                    const isActive = team.id === activeTeamId;

                    return (
                        <div key={team.id} className="relative group max-w-xs flex-1 flex flex-col justify-end">
                            <motion.div
                                onClick={() => onSetActiveTeam(team.id)}
                                animate={{
                                    y: isActive ? -10 : 0,
                                    scale: isActive ? 1.05 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={cn(
                                    "relative w-full cursor-pointer rounded-t-xl overflow-hidden transition-colors border-x border-t flex flex-col",
                                    isActive
                                        ? "bg-game-surface border-game-accent shadow-[0_-5px_20px_rgba(245,158,11,0.2)]"
                                        : "bg-game-surface/50 border-gray-700 hover:bg-game-surface"
                                )}
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-game-accent shadow-[0_0_10px_#f59e0b]" />
                                )}

                                <div className="p-3 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        {isActive ? (
                                            <Trophy className="w-4 h-4 text-game-accent animate-bounce" />
                                        ) : (
                                            <Shield className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span className={cn(
                                            "font-bold truncate max-w-[150px] text-sm",
                                            isActive ? "text-white" : "text-gray-400"
                                        )}>
                                            {team.name}
                                        </span>
                                    </div>

                                    <div className={cn(
                                        "text-2xl font-black font-mono tracking-wider mb-2",
                                        isActive ? "text-game-primary" : "text-gray-500"
                                    )}>
                                        {team.score.toLocaleString()}
                                    </div>

                                    {/* Inventory */}
                                    <div className="w-full flex justify-center mb-1">
                                        <InventoryDisplay
                                            inventory={team.inventory || []} // Handle undefined inventory
                                            onActivate={(card) => onActivateCard(team.id, card)}
                                            canActivate={true} // Logic will be handled in App.tsx or we can refine here.
                                        // For now, allow clicking and let parent decide if valid. 
                                        // Actually better to pass canActivate logic.
                                        // For Steal Selection: Any team can activate.
                                        // For others: Only active team? 
                                        // Let's pass true for now and handle logic in onActivateCard handler in App.
                                        />
                                    </div>

                                    {isActive && (
                                        <div className="text-[10px] uppercase tracking-widest text-game-accent font-bold mt-1">
                                            Active Team
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Settings Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setManagingTeamId(team.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-game-primary text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                                <Settings className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {managingTeamId && (
                    <TeamManagementModal
                        team={teams.find(t => t.id === managingTeamId)!}
                        teams={teams}
                        onUpdateTeam={onUpdateTeam}
                        onClose={() => setManagingTeamId(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
