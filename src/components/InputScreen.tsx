import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
// import { cn } from '../lib/utils'; // Fixed import path

interface InputScreenProps {
    onStartGame: (players: string[]) => void;
}

export function InputScreen({ onStartGame }: InputScreenProps) {
    const [input, setInput] = useState('');

    // Parse players
    const players = input
        .split(/[\n,]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const playerCount = players.length;
    const isValid = playerCount >= 4;

    const handleStart = () => {
        if (!isValid) return;
        onStartGame(players);
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
                <div className="flex justify-between items-end">
                    <label htmlFor="players-input" className="block text-sm text-gray-400 font-medium">
                        Enter player names <span className="text-gray-500">(one per line or comma separated)</span>
                    </label>
                    <span
                        id="player-count-help"
                        className={`text-sm flex items-center gap-1.5 transition-colors duration-300 ${
                            isValid ? 'text-green-400' : 'text-amber-400'
                        }`}
                        aria-live="polite"
                    >
                        {isValid ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        {playerCount} / 4 required
                    </span>
                </div>

                <textarea
                    id="players-input"
                    aria-describedby="player-count-help"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full h-64 bg-game-dark/50 border rounded-xl p-4 text-lg focus:ring-2 focus:outline-none transition-all resize-none ${
                        isValid
                            ? 'border-gray-700 focus:ring-game-primary'
                            : 'border-amber-500/30 focus:ring-amber-500/50'
                    }`}
                    placeholder="Alice&#10;Bob&#10;Charlie&#10;David..."
                />

                <button
                    onClick={handleStart}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transform transition-all shadow-lg ${
                        isValid
                            ? 'bg-gradient-to-r from-game-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20 cursor-pointer text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    }`}
                >
                    <Play className={`w-5 h-5 ${isValid ? '' : 'opacity-50'}`} />
                    Generate Teams
                </button>
            </div>
        </motion.div>
    );
}
