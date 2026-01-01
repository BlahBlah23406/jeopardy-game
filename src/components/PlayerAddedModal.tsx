
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield } from 'lucide-react';
import { useEffect } from 'react';

interface PlayerAddedModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerName: string;
    teamName: string;
}

export function PlayerAddedModal({ isOpen, onClose, playerName, teamName }: PlayerAddedModalProps) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-game-surface border-2 border-game-accent p-8 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center text-center max-w-md w-full mx-4"
                    >
                        <div className="w-20 h-20 bg-game-accent/20 rounded-full flex items-center justify-center mb-6 animate-[bounce_1s_infinite]">
                            <UserPlus className="w-10 h-10 text-game-accent" />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                            PLAYER JOINED!
                        </h2>

                        <p className="text-xl text-gray-400 mb-8">
                            <span className="font-bold text-white">{playerName}</span> has been assigned to
                        </p>

                        <div className="bg-game-primary/50 border border-game-accent/50 px-8 py-4 rounded-xl flex items-center gap-4">
                            <Shield className="w-8 h-8 text-game-accent" />
                            <span className="text-2xl font-black text-game-accent uppercase tracking-widest">
                                {teamName}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
