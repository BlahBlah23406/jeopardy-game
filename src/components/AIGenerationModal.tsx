import { useState, useEffect } from 'react';
import { Category, Question } from '../types';
import { generateGameDataFromPrompt } from '../lib/gemini';

const STORAGE_KEY = 'jeopardy-gemini-key';

interface AIGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (categories: Category[], finalJeopardyQuestions: Question[]) => void;
}

export function AIGenerationModal({ isOpen, onClose, onGenerate }: AIGenerationModalProps) {
    const [prompt, setPrompt] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [rememberKey, setRememberKey] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    // Load saved API key on mount
    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem(STORAGE_KEY);
            if (savedKey) {
                setApiKey(savedKey);
                setRememberKey(true);
                setShowApiKeyInput(false);
            } else {
                setShowApiKeyInput(true);
            }
        }
    }, [isOpen]);

    // If not open, render nothing
    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim() || !apiKey.trim()) return;

        setIsGenerating(true);
        setError(null);

        // Handle saving/removing key from local storage
        if (rememberKey) {
            localStorage.setItem(STORAGE_KEY, apiKey.trim());
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }

        try {
            const data = await generateGameDataFromPrompt(prompt, apiKey.trim());
            onGenerate(data.categories, data.finalJeopardyQuestions);
            setPrompt(''); // Clear the prompt for next time
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || "Failed to generate game data. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100] p-4 font-sans backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 max-w-xl w-full shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        AI Generate
                    </h2>
                    <button onClick={onClose} disabled={isGenerating} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <p className="text-purple-300 mb-6 font-medium">Describe the topic or themes for your game, and our AI will automatically generate 6 categories and 30 questions.</p>

                <div className="space-y-4 mb-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide">Gemini API Key</label>
                            {!showApiKeyInput && (
                                <button
                                    onClick={() => setShowApiKeyInput(true)}
                                    className="text-xs text-purple-400 hover:text-purple-300 underline font-bold"
                                >
                                    Change Key
                                </button>
                            )}
                        </div>
                        {showApiKeyInput ? (
                            <>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API Key..."
                                    className="w-full bg-gray-800 border-2 border-gray-700 hover:border-gray-600 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none font-mono shadow-inner transition-colors"
                                    disabled={isGenerating}
                                />
                                <div className="flex items-center mt-3 gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember-key"
                                        checked={rememberKey}
                                        onChange={(e) => setRememberKey(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700 accent-purple-500"
                                        disabled={isGenerating}
                                    />
                                    <label htmlFor="remember-key" className="text-sm text-gray-400 cursor-pointer select-none">
                                        Remember API Key on this device
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-purple-300 bg-purple-900/20 p-3 rounded-xl border border-purple-500/30">
                                Using saved Gemini API Key.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Generator Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A game with 80s movie trivia, internet pop culture, and retro video games..."
                        className="w-full bg-gray-800 border-2 border-gray-700 hover:border-gray-600 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none resize-none h-32 font-bold shadow-inner transition-colors"
                        disabled={isGenerating}
                    />
                </div>

                {error && (
                    <div className="text-red-400 bg-red-900/40 p-3 rounded-lg border border-red-500/50 mb-4 text-sm font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim() || !apiKey.trim()}
                        className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Data...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Generate Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
