import React from 'react';
import { motion } from 'framer-motion';

interface RulesScreenProps {
    title: string;
    rules: { text: string; icon?: string; highlight?: boolean }[];
    onContinue: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({ title, rules, onContinue }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-5xl mx-auto min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 w-full shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-sm tracking-tight"
                >
                    {title}
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative z-10">
                    {rules.map((rule, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (index * 0.1) }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            className={`flex items-center gap-6 text-lg p-6 rounded-2xl border transition-all duration-300 ${rule.highlight
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <span className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl shadow-inner ${rule.highlight ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
                                }`}>
                                {rule.icon || (index + 1)}
                            </span>
                            <span className={`leading-relaxed font-medium ${rule.highlight ? 'text-yellow-100' : 'text-white/90'}`}>
                                {rule.text}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (rules.length * 0.1) + 0.2 }}
                    className="flex justify-center relative z-10"
                >
                    <button
                        onClick={onContinue}
                        className="group relative px-16 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-black text-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center gap-3">
                            LET'S PLAY
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};
