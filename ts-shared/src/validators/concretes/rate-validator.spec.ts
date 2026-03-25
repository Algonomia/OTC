import { AlgoRateValidator } from './rate-validator';

describe('AlgoRateValidator', () => {
    describe('required', () => {
        const v = new AlgoRateValidator({ required: true, maxRate: 5 });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should accept a valid rate', () => {
            expect(v.checkErrors(3)).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoRateValidator({ maxRate: 5 });

        it('should accept null without error', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });

        it('should accept undefined without error', () => {
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('bounds with default maxRate (5)', () => {
        const v = new AlgoRateValidator({ maxRate: 5 });

        it('should error when value is below 1', () => {
            expect(v.checkErrors(0)).toContainEqual({ notRespectedBound: { min: 1, max: 5 } });
        });

        it('should error when value is negative', () => {
            expect(v.checkErrors(-1)).toContainEqual({ notRespectedBound: { min: 1, max: 5 } });
        });

        it('should error when value exceeds maxRate', () => {
            expect(v.checkErrors(6)).toContainEqual({ notRespectedBound: { min: 1, max: 5 } });
        });

        it('should accept value at lower bound (1)', () => {
            expect(v.checkErrors(1)).toEqual([]);
        });

        it('should accept value at upper bound (maxRate)', () => {
            expect(v.checkErrors(5)).toEqual([]);
        });

        it('should accept value within bounds', () => {
            expect(v.checkErrors(3)).toEqual([]);
        });
    });

    describe('bounds with custom maxRate (10)', () => {
        const v = new AlgoRateValidator({ maxRate: 10 });

        it('should error when value exceeds custom maxRate', () => {
            expect(v.checkErrors(11)).toContainEqual({ notRespectedBound: { min: 1, max: 10 } });
        });

        it('should accept value at custom maxRate', () => {
            expect(v.checkErrors(10)).toEqual([]);
        });
    });
});
