import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string | null;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    if (!message) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -50, x: '-50%' }}
                className="fixed top-8 left-1/2 z-[100] bg-game-surface border border-game-primary/50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 backdrop-blur-xl pointer-events-auto cursor-pointer"
                onClick={onClose}
            >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-bold text-lg">{message}</span>
            </motion.div>
        </AnimatePresence>
    );
}
