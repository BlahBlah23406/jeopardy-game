import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
// import { cn } from '../lib/utils'; // Fixed import path

interface InputScreenProps {
    onStartGame: (players: string[]) => void;
}

export function InputScreen({ onStartGame }: InputScreenProps) {
    const [input, setInput] = useState('');

    const handleStart = () => {
        // Split by newlines or commas and filter empty strings
        const players = input
            .split(/[\n,]/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (players.length < 4) {
            alert('Please enter at least 4 players!');
            return;
        }

        onStartGame(players);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-game-surface p-8 rounded-2xl shadow-2xl border border-game-primary/20"
        >
            <div className="flex items-center gap-4 mb-6">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 drop-shadow-lg" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-game-primary to-purple-400 bg-clip-text text-transparent">
                    Player Registration
                </h2>
            </div>

            <div className="space-y-4">
                <label className="block text-sm text-gray-400">
                    Enter player names (one per line or comma separated)
                </label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-64 bg-game-dark/50 border border-gray-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-game-primary focus:outline-none transition-all resize-none"
                    placeholder="Alice&#10;Bob&#10;Charlie&#10;David..."
                />

                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-gradient-to-r from-game-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                >
                    <Play className="w-5 h-5" />
                    Generate Teams
                </button>
            </div>
        </motion.div>
    );
}
