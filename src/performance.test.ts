import { describe, it, expect } from 'vitest';
import { Category, Question } from './types';

// Mock data structures
const createMockQuestion = (id: string): Question => ({
    id,
    points: 100,
    text: 'Test Question',
    answer: 'Test Answer',
    isAnswered: false,
});

const createMockCategory = (id: string, questionIds: string[]): Category => ({
    id,
    title: 'Test Category',
    questions: questionIds.map(createMockQuestion),
});

describe('Performance Optimization', () => {
    it('demonstrates inefficiency of naive map update', () => {
        // Setup initial state
        const initialCategories: Category[] = [
            createMockCategory('c1', ['q1', 'q2']),
            createMockCategory('c2', ['q3', 'q4']),
        ];

        const questionIdToAnswer = 'q1';

        // Naive update logic (current implementation in App.tsx)
        const nextCategories = initialCategories.map(cat => ({
            ...cat,
            questions: cat.questions.map(q =>
                q.id === questionIdToAnswer ? { ...q, isAnswered: true } : q
            )
        }));

        // Verify functionality
        expect(nextCategories[0].questions[0].isAnswered).toBe(true);

        // Verify inefficiency: Even though c2 was not touched, it is a new object
        expect(nextCategories[1]).not.toBe(initialCategories[1]);
        expect(nextCategories[1].questions).not.toBe(initialCategories[1].questions);
    });

    it('demonstrates efficiency of optimized update', () => {
        // Setup initial state
        const initialCategories: Category[] = [
            createMockCategory('c1', ['q1', 'q2']),
            createMockCategory('c2', ['q3', 'q4']),
        ];

        const questionIdToAnswer = 'q1';

        // Optimized update logic
        const nextCategories = initialCategories.map(cat => {
            const hasQuestion = cat.questions.some(q => q.id === questionIdToAnswer);
            if (!hasQuestion) return cat;

            return {
                ...cat,
                questions: cat.questions.map(q =>
                    q.id === questionIdToAnswer ? { ...q, isAnswered: true } : q
                )
            };
        });

        // Verify functionality
        expect(nextCategories[0].questions[0].isAnswered).toBe(true);

        // Verify efficiency: c2 should be the SAME object
        expect(nextCategories[1]).toBe(initialCategories[1]);
        expect(nextCategories[1].questions).toBe(initialCategories[1].questions);
    });
});
