import { AlgoMultiListValidator } from './multi-list-validator';

describe('AlgoMultiListValidator', () => {
    describe('required', () => {
        const v = new AlgoMultiListValidator({ required: true, list: ['a', 'b', 'c'] });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should error on empty array', () => {
            expect(v.checkErrors([])).toContainEqual({ required: true });
        });

        it('should accept a non-empty array of valid values', () => {
            expect(v.checkErrors(['a', 'b'])).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoMultiListValidator({ list: ['a', 'b', 'c'] });

        it('should accept null without error', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });

        it('should accept undefined without error', () => {
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('restrictToList', () => {
        const v = new AlgoMultiListValidator({ list: ['a', 'b', 'c'] });

        it('should error when array contains values not in list', () => {
            expect(v.checkErrors(['a', 'z'])).toContainEqual({ notInList: ['z'] });
        });

        it('should accept array with all values in list', () => {
            expect(v.checkErrors(['a', 'b', 'c'])).toEqual([]);
        });

        it('should error when single value is not in list', () => {
            expect(v.checkErrors('z')).toContainEqual({ notInList: ['z'] });
        });
    });

    describe('minLength', () => {
        const v = new AlgoMultiListValidator({ list: ['a', 'b', 'c'], minLength: 2 });

        it('should error when array length is below minLength', () => {
            expect(v.checkErrors(['a'])).toContainEqual({
                minlength: { requiredLength: 2, actualLength: 1 },
            });
        });

        it('should accept array at minLength', () => {
            expect(v.checkErrors(['a', 'b'])).toEqual([]);
        });

        it('should accept array above minLength', () => {
            expect(v.checkErrors(['a', 'b', 'c'])).toEqual([]);
        });

        it('should skip check on null', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });

    describe('maxLength', () => {
        const v = new AlgoMultiListValidator({ list: ['a', 'b', 'c', 'd'], maxLength: 2 });

        it('should error when array length exceeds maxLength', () => {
            expect(v.checkErrors(['a', 'b', 'c'])).toContainEqual({
                maxlength: { requiredLength: 2, actualLength: 3 },
            });
        });

        it('should accept array at maxLength', () => {
            expect(v.checkErrors(['a', 'b'])).toEqual([]);
        });

        it('should accept array below maxLength', () => {
            expect(v.checkErrors(['a'])).toEqual([]);
        });

        it('should skip check on null', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });

    describe('minLength and maxLength combined', () => {
        const v = new AlgoMultiListValidator({
            list: ['a', 'b', 'c', 'd', 'e'],
            minLength: 2,
            maxLength: 4,
        });

        it('should error when below minLength', () => {
            expect(v.checkErrors(['a'])).toContainEqual({
                minlength: { requiredLength: 2, actualLength: 1 },
            });
        });

        it('should error when above maxLength', () => {
            expect(v.checkErrors(['a', 'b', 'c', 'd', 'e'])).toContainEqual({
                maxlength: { requiredLength: 4, actualLength: 5 },
            });
        });

        it('should accept array within range', () => {
            expect(v.checkErrors(['a', 'b', 'c'])).toEqual([]);
        });
    });
});
