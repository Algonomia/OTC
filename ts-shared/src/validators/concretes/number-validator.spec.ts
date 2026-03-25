import { AlgoNumberValidator, AlgoPercentageValidator } from './number-validator';

describe('AlgoNumberValidator', () => {
    describe('required', () => {
        const v = new AlgoNumberValidator({ required: true });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should accept 0 (falsy but valid)', () => {
            expect(v.checkErrors(0)).toEqual([]);
        });
    });

    describe('min / max', () => {
        const v = new AlgoNumberValidator({ min: 0, max: 100 });

        it('should error when below min', () => {
            expect(v.checkErrors(-1)).toContainEqual({ min: { min: 0 } });
        });

        it('should error when above max', () => {
            expect(v.checkErrors(101)).toContainEqual({ max: { max: 100 } });
        });

        it('should accept values at boundaries', () => {
            expect(v.checkErrors(0)).toEqual([]);
            expect(v.checkErrors(100)).toEqual([]);
        });

        it('should skip bounds checks on null (not required)', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });
});

describe('AlgoPercentageValidator', () => {
    const v = new AlgoPercentageValidator({ required: true });

    it('should enforce 0-100 range automatically', () => {
        expect(v.checkErrors(-1)).toContainEqual({ min: { min: 0 } });
        expect(v.checkErrors(101)).toContainEqual({ max: { max: 100 } });
    });

    it('should accept valid percentages', () => {
        expect(v.checkErrors(0)).toEqual([]);
        expect(v.checkErrors(50)).toEqual([]);
        expect(v.checkErrors(100)).toEqual([]);
    });
});
