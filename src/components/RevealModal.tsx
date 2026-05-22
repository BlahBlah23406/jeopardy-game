import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { AdvantageCardType } from '../types';

interface RevealModalProps {
    type: 'DOUBLE_JEOPARDY' | AdvantageCardType;
    onClose: () => void;
}

const INFO: Record<string, { title: string; subtitle: string; icon: React.ElementType; color: string }> = {
    'DOUBLE_JEOPARDY': {
        title: 'DOUBLE JEOPARDY!',
        subtitle: 'Points are doubled for this question!',
        icon: Zap,
        color: 'text-yellow-400'
    },
    'DOUBLE_POINTS': {
        title: 'DOUBLE POINTS CARD!',
        subtitle: 'Double the points of any future question!',
        icon: Sparkles,
        color: 'text-yellow-300'
    },
    'STEAL_SELECTION': {
        title: 'STEAL TURN CARD!',
        subtitle: 'Steal control of the board at any time!',
        icon: ArrowRightLeft,
        color: 'text-purple-400'
    },
    'RESET_REP': {
        title: 'RESET ROSTER CARD!',
        subtitle: 'Unlock all your team members again!',
        icon: RotateCcw,
        color: 'text-blue-400'
    }
};

export function RevealModal({ type, onClose }: RevealModalProps) {
    const info = INFO[type];

    useEffect(() => {
        const audio = new Audio('/reveal-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
                onClick={onClose}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Confetti / Burst effect placeholder */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: Math.random() * 0.5 + 0.5
                            }}
                            animate={{
                                x: (Math.random() - 0.5) * 800,
                                y: (Math.random() - 0.5) * 800,
                                opacity: 0,
                                rotate: Math.random() * 360
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full ${['bg-yellow-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500'][Math.floor(Math.random() * 4)]}`}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="flex flex-col items-center text-center p-12"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <info.icon className={`w-32 h-32 ${info.color} mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]`} />
                    </motion.div>

                    <h1 className={`text-6xl font-black mb-4 uppercase tracking-tighter ${info.color} drop-shadow-2xl`}>
                        {info.title}
                    </h1>

                    <p className="text-2xl text-white font-bold opacity-90 max-w-lg">
                        {info.subtitle}
                    </p>

                    <div className="mt-12 text-gray-400 animate-pulse uppercase tracking-widest text-sm">
                        Click anywhere to continue
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
