import { useState, useRef } from 'react';
import { Category, Question } from '../types';
import { AIGenerationModal } from './AIGenerationModal';

interface QuestionSetupScreenProps {
    onComplete: (categories: Category[], finalJeopardyQuestions: Question[]) => void;
}

interface GameExportData {
    version: number;
    categories: Category[];
    finalJeopardyQuestions: Question[];
}

export function QuestionSetupScreen({ onComplete }: QuestionSetupScreenProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Initial State: 1 Category with 5 questions
    const [categories, setCategories] = useState<Category[]>([
        {
            id: `cat - ${Date.now()} `,
            title: '',
            questions: Array.from({ length: 5 }, (_, i) => ({
                id: `q - ${Date.now()} -${i} `,
                points: (i + 1) * 100,
                text: '',
                answer: '',
                moreInfo: '',
                isAnswered: false
            }))
        }
    ]);

    const [finalJeopardyQuestions, setFinalJeopardyQuestions] = useState<Question[]>([
        {
            id: `fj - ${Date.now()} `,
            points: 2000,
            text: '',
            answer: '',
            moreInfo: '',
            isAnswered: false
        }
    ]);

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleAIGenerated = (newCategories: Category[], newFinalJeopardyQuestions: Question[]) => {
        setCategories(newCategories);
        setFinalJeopardyQuestions(newFinalJeopardyQuestions);
    };

    const handleAddCategory = () => {
        if (categories.length >= 6) return;
        setCategories(prev => [
            ...prev,
            {
                id: `cat - ${Date.now()} `,
                title: '',
                questions: Array.from({ length: 5 }, (_, i) => ({
                    id: `q - ${Date.now()} -${i} `,
                    points: (i + 1) * 100,
                    text: '',
                    answer: '',
                    moreInfo: '',
                    isAnswered: false
                }))
            }
        ]);
    };

    const handleRemoveCategory = (index: number) => {
        setCategories(prev => prev.filter((_, i) => i !== index));
    };

    const handleCategoryTitleChange = (index: number, title: string) => {
        setCategories(prev => prev.map((cat, i) => i === index ? { ...cat, title } : cat));
    };

    const handleQuestionChange = (catIndex: number, qIndex: number, field: keyof Question, value: string) => {
        setCategories(prev => prev.map((cat, i) => {
            if (i !== catIndex) return cat;
            const newQuestions = [...cat.questions];
            newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
            return { ...cat, questions: newQuestions };
        }));
    };

    // Final Jeopardy Handlers
    const handleAddFinalJeopardy = () => {
        setFinalJeopardyQuestions(prev => [
            ...prev,
            {
                id: `fj - ${Date.now()} `,
                points: 2000,
                text: '',
                answer: '',
                moreInfo: '',
                isAnswered: false
            }
        ]);
    };

    const handleRemoveFinalJeopardy = (index: number) => {
        setFinalJeopardyQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinalJeopardyChange = (index: number, field: keyof Question, value: string) => {
        setFinalJeopardyQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    };

    const handleComplete = () => {
        // Validate?
        // Basic validation: Check if titles are empty
        const cleanCategories = categories.filter(c => c.title.trim() !== '');
        // If empty, maybe user wants default? 
        // We will pass what we have. If empty array, App.tsx logic can fallback or use empty.
        // Actually the `generateGameData` logic I wrote: if customCategories provided & length > 0, usages it.
        // If the user deletes all categories here, we pass []. `generateGameData` sees length 0 -> uses default.

        // Also filter out empty FJ questions
        const cleanFJ = finalJeopardyQuestions.filter(q => q.text.trim() !== '');

        onComplete(cleanCategories, cleanFJ);
    };

    const handleExport = () => {
        const data: GameExportData = {
            version: 1,
            categories,
            finalJeopardyQuestions
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jeopardy-game-data-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text) as GameExportData;

                if (data.categories && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                }
                if (data.finalJeopardyQuestions && Array.isArray(data.finalJeopardyQuestions)) {
                    setFinalJeopardyQuestions(data.finalJeopardyQuestions);
                }
                // Reset file input so same file can be selected again if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error("Failed to parse game data", error);
                alert("Failed to load file. Please ensure it is a valid JSON game file.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 flex flex-col gap-8 pb-32">
            <header className="text-center space-y-4 relative">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest text-shadow-lg">Game Setup</h1>
                    <p className="text-blue-300">Create your categories and questions.</p>
                </div>

                {/* Import/Export/AI Controls */}
                <div className="flex gap-4 justify-center flex-wrap">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold shadow-lg transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Data
                    </button>

                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all border border-purple-400 transform hover:scale-105"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        AI Generate
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold shadow-lg transition-all border border-gray-500"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Import Data
                    </button>
                    <input
                        type="file"
                        accept=".txt,.json,text/plain"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </header>

            {/* CATEGORIES SECTION */}
            <div className="space-y-8">
                {categories.map((category, catIndex) => (
                    <div key={category.id} className="bg-gray-800/80 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                            <input
                                value={category.title}
                                onChange={(e) => handleCategoryTitleChange(catIndex, e.target.value)}
                                placeholder={`Category ${catIndex + 1} Name`}
                                className="bg-transparent text-2xl font-bold text-yellow-400 placeholder-gray-600 focus:outline-none w-full"
                            />
                            <button
                                onClick={() => handleRemoveCategory(catIndex)}
                                className="text-red-500 hover:text-red-400 text-sm font-bold uppercase"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="space-y-4">
                            {category.questions.map((q, qIndex) => (
                                <div key={q.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-900/50 p-4 rounded-lg">
                                    <div className="md:col-span-1 flex items-center justify-center h-full">
                                        <span className="text-xl font-bold text-blue-400">{q.points}</span>
                                    </div>
                                    <div className="md:col-span-11 grid gap-3">
                                        <input
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(catIndex, qIndex, 'text', e.target.value)}
                                            placeholder="Question Text"
                                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                value={q.answer}
                                                onChange={(e) => handleQuestionChange(catIndex, qIndex, 'answer', e.target.value)}
                                                placeholder="Answer"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-green-300 focus:border-green-500 focus:outline-none"
                                            />
                                            <input
                                                value={q.moreInfo || ''}
                                                onChange={(e) => handleQuestionChange(catIndex, qIndex, 'moreInfo', e.target.value)}
                                                placeholder="More Info (Optional)"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-400 focus:border-gray-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddCategory}
                    disabled={categories.length >= 6}
                    className={`w-full py-4 border-2 border-dashed border-gray-600 text-gray-400 rounded-xl transition-colors font-bold uppercase tracking-widest ${categories.length >= 6
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-blue-500 hover:text-blue-400'
                        }`}
                >
                    {categories.length >= 6 ? 'Category Limit Reached (Max 6)' : '+ Add Category'}
                </button>
            </div>

            {/* FINAL JEOPARDY SECTION */}
            <div className="bg-indigo-900/30 p-8 rounded-xl border border-indigo-500/30">
                <header className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Final Jeopardy</h2>
                    <p className="text-indigo-300 text-sm">Add questions for the final round. If there are more teams than questions, questions will repeat.</p>
                </header>

                <div className="space-y-4">
                    {finalJeopardyQuestions.map((q, index) => (
                        <div key={q.id} className="bg-gray-900/80 p-4 rounded-lg border border-indigo-500/20 relative group">
                            <button
                                onClick={() => handleRemoveFinalJeopardy(index)}
                                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                            >
                                ×
                            </button>
                            <div className="grid gap-3">
                                <input
                                    value={q.text}
                                    onChange={(e) => handleFinalJeopardyChange(index, 'text', e.target.value)}
                                    placeholder={`Final Jeopardy Question ${index + 1} `}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        value={q.answer}
                                        onChange={(e) => handleFinalJeopardyChange(index, 'answer', e.target.value)}
                                        placeholder="Answer"
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-green-300 focus:border-green-500 focus:outline-none"
                                    />
                                    <input
                                        value={q.moreInfo || ''}
                                        onChange={(e) => handleFinalJeopardyChange(index, 'moreInfo', e.target.value)}
                                        placeholder="More Info (Optional)"
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-400 focus:border-gray-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddFinalJeopardy}
                        className="w-full py-3 border-2 border-dashed border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-900/50 transition-colors font-bold"
                    >
                        + Add Final Jeopardy Question
                    </button>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-50">
                <button
                    onClick={handleComplete}
                    className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(22,163,74,0.6)] hover:shadow-[0_0_30px_rgba(22,163,74,0.8)] transition-all transform hover:scale-105 active:scale-95"
                >
                    Continue to Players
                </button>
            </div>

            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGenerated}
            />
        </div>
    );
}
