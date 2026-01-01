// Simple confetti effect using CSS particles or just a nice overlay
// For a "wow" factor, we can try to use a canvas or just heavy CSS animations.

interface WinnerScreenProps {
    winnerName: string;
}

export function WinnerScreen({ winnerName }: WinnerScreenProps) {

    // Auto-fire confetti on mount?
    // We'll stick to CSS-only for simplicity and performance without external libs.

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* Background Rays */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-30">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg,transparent_0deg,yellow_20deg,transparent_40deg,yellow_60deg,transparent_80deg,yellow_100deg,transparent_120deg,yellow_140deg,transparent_160deg,yellow_180deg,transparent_200deg,yellow_220deg,transparent_240deg,yellow_260deg,transparent_280deg,yellow_300deg,transparent_320deg,yellow_340deg,transparent_360deg)] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-1000">
                <div className="text-yellow-500 font-black text-2xl tracking-[1em] uppercase mb-8 animate-pulse mr-[-1em]">
                    Champion
                </div>

                <h1 className="text-8xl md:text-9xl font-black text-white text-center drop-shadow-[0_0_50px_rgba(234,179,8,0.8)]">
                    {winnerName}
                </h1>

                <div className="mt-12 text-center text-gray-400">
                    Congratulations! You have won the tournament!
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-16 px-8 py-3 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-white transition-all uppercase text-xs tracking-widest"
                >
                    Return to Start
                </button>
            </div>

            {/* Floating particles/confetti */}
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `float ${3 + Math.random() * 5}s linear infinite`,
                        opacity: Math.random()
                    }}
                />
            ))}

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(-100vh) rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
