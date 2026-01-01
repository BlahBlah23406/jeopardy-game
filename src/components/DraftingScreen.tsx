import { Team, Player } from '../types';

interface DraftingScreenProps {
    teams: Team[];
    draftingPool: Player[];
    currentDrafterId: string;
    onPick: (player: Player) => void;
}

export function DraftingScreen({ teams, draftingPool, currentDrafterId, onPick }: DraftingScreenProps) {
    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 gap-8">
            <h2 className="text-4xl font-black text-center text-yellow-400 uppercase tracking-widest drop-shadow-lg">
                Draft Your Team
            </h2>

            {/* Teams / Captains Display */}
            <div className="grid grid-cols-4 gap-4 flex-1">
                {teams.map(team => {
                    const isDrafting = team.id === currentDrafterId;
                    return (
                        <div
                            key={team.id}
                            className={`
                                relative flex flex-col items-center bg-gray-900/80 rounded-xl overflow-hidden border-2 transition-all duration-300
                                ${isDrafting ? 'border-yellow-400 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.5)] z-10' : 'border-gray-700 opacity-70'}
                            `}
                        >
                            {/* Header */}
                            <div className={`w-full p-4 text-center ${isDrafting ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                <h3 className="font-bold text-xl truncate">{team.name}</h3>
                                {isDrafting && <div className="text-xs font-black uppercase mt-1 animate-pulse">Selecting...</div>}
                            </div>

                            {/* Players List */}
                            <div className="flex-1 w-full p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                {team.players.map(player => (
                                    <div key={player.id} className="bg-gray-800 p-2 rounded text-center text-sm border border-gray-700">
                                        {player.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Picking Pool */}
            <div className="bg-black/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                <h3 className="text-center text-gray-400 text-sm uppercase tracking-widest mb-4">Available Players</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {draftingPool.map(player => (
                        <button
                            key={player.id}
                            onClick={() => onPick(player)}
                            className="
                                px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg 
                                transform hover:-translate-y-1 transition-all active:scale-95 border-b-4 border-blue-800 hover:border-blue-700
                            "
                        >
                            {player.name}
                        </button>
                    ))}

                    {draftingPool.length === 0 && (
                        <div className="text-gray-500 italic">Draft Complete! Getting ready...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
