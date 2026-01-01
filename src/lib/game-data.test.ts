import { describe, it, expect } from 'vitest';
import { generateGameData } from './game-data';

describe('generateGameData', () => {
    it('should generate 6 categories', () => {
        const categories = generateGameData();
        expect(categories).toHaveLength(6);
    });

    it('should have 5 questions per category with correct points', () => {
        const categories = generateGameData();
        categories.forEach((cat) => {
            expect(cat.questions).toHaveLength(5);
            cat.questions.forEach((q, index) => {
                // Points should be (index + 1) * 100, OR doubled if DJ
                const basePoints = (index + 1) * 100;
                if (q.isDoubleJeopardy) {
                    expect(q.points).toBe(basePoints * 2);
                } else {
                    expect(q.points).toBe(basePoints);
                }
            });
        });
    });

    it('should randomly assign exactly 9 advantage cards', () => {
        const categories = generateGameData();
        let cardCount = 0;
        const rewardTypes: string[] = [];

        categories.forEach(cat => {
            cat.questions.forEach(q => {
                if (q.rewardCard) {
                    cardCount++;
                    rewardTypes.push(q.rewardCard);
                }
            });
        });

        expect(cardCount).toBe(9);

        // Check distribution: 3 of each type
        const typeCounts = rewardTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        expect(typeCounts['DOUBLE_POINTS']).toBe(3);
        expect(typeCounts['STEAL_SELECTION']).toBe(3);
        expect(typeCounts['RESET_REP']).toBe(3);
    });

    it('should ensure reward cards are NOT on Double Jeopardy questions', () => {
        const categories = generateGameData();
        categories.forEach(cat => {
            cat.questions.forEach(q => {
                if (q.rewardCard) {
                    expect(q.isDoubleJeopardy).toBeFalsy();
                }
            });
        });
    });
});
