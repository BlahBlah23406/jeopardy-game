import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play } from 'lucide-react';
// import { cn } from '../lib/utils'; // Fixed import path

interface InputScreenProps {
    onStartGame: (players: string[]) => void;
}

export function InputScreen({ onStartGame }: InputScreenProps) {
    const [input, setInput] = useState('');

    // Parse players on every render to provide live feedback
    const validPlayers = input
        .split(/[\n,]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const isValid = validPlayers.length >= 4;

    const handleStart = () => {
        if (!isValid) return;
        onStartGame(validPlayers);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-game-surface p-8 rounded-2xl shadow-2xl border border-game-primary/20"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-game-primary/20 rounded-full">
                    <Users className="w-8 h-8 text-game-primary" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-game-primary to-purple-400 bg-clip-text text-transparent">
                    Player Registration
                </h2>
            </div>

            <div className="space-y-4">
                <label htmlFor="player-input" className="block text-sm text-gray-400">
                    Enter player names (one per line or comma separated)
                </label>
                <textarea
                    id="player-input"
                    aria-describedby="player-count-helper"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-64 bg-game-dark/50 border border-gray-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-game-primary focus:outline-none transition-all resize-none"
                    placeholder="Alice&#10;Bob&#10;Charlie&#10;David..."
                />

                <div className="flex justify-between items-center px-1">
                    <p
                        id="player-count-helper"
                        className={`text-sm font-medium transition-colors ${isValid ? 'text-green-400' : 'text-orange-400'}`}
                        aria-live="polite"
                    >
                        {validPlayers.length} players entered {isValid ? '✅' : '(minimum 4 required)'}
                    </p>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transform transition-all shadow-lg
                        ${isValid
                            ? 'bg-gradient-to-r from-game-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20'
                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                >
                    <Play className="w-5 h-5" />
                    Generate Teams
                </button>
            </div>
        </motion.div>
    );
}
