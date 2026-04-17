import { describe, it, expect } from 'vitest';
import { shuffle } from './utils';

describe('utils', () => {
    describe('shuffle', () => {
        it('should return an array of the same length', () => {
            const array = [1, 2, 3, 4, 5];
            const result = shuffle(array);
            expect(result).toHaveLength(array.length);
        });

        it('should contain all the original elements', () => {
            const array = [1, 2, 3, 4, 5];
            const result = shuffle(array);
            expect(result).toEqual(expect.arrayContaining(array));
        });

        it('should not modify the original array', () => {
            const array = [1, 2, 3, 4, 5];
            const arrayCopy = [...array];
            shuffle(array);
            expect(array).toEqual(arrayCopy);
        });
    });
});
