import { AlgoMonoListValidator } from './mono-list-validator';

describe('AlgoMonoListValidator', () => {
    describe('required', () => {
        const v = new AlgoMonoListValidator({ required: true, list: ['a', 'b', 'c'] });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should accept a value from the list', () => {
            expect(v.checkErrors('a')).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoMonoListValidator({ list: ['a', 'b', 'c'] });

        it('should accept null without error', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });

        it('should accept undefined without error', () => {
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('restrictToList', () => {
        const v = new AlgoMonoListValidator({ list: ['a', 'b', 'c'] });

        it('should error when value is not in list', () => {
            expect(v.checkErrors('z')).toContainEqual({ notInList: ['z'] });
        });

        it('should accept value in list', () => {
            expect(v.checkErrors('b')).toEqual([]);
        });
    });

    describe('with number list', () => {
        const v = new AlgoMonoListValidator<number, number>({ list: [1, 2, 3] });

        it('should accept number in list', () => {
            expect(v.checkErrors(1)).toEqual([]);
        });

        it('should error on number not in list', () => {
            expect(v.checkErrors(99)).toContainEqual({ notInList: [99] });
        });
    });
});
