import { AlgoDateValidator } from './date-validator';

describe('AlgoDateValidator', () => {
    describe('required', () => {
        const v = new AlgoDateValidator({ required: true });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should accept a valid date', () => {
            expect(v.checkErrors(new Date('2024-06-15'))).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoDateValidator({});

        it('should accept null without error', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });

        it('should accept undefined without error', () => {
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('minDate', () => {
        const minDate = new Date('2024-01-01');
        const v = new AlgoDateValidator({ minDate });

        it('should error when date is before minDate', () => {
            expect(v.checkErrors(new Date('2023-12-31'))).toContainEqual({ minDateExceeded: true });
        });

        it('should accept date equal to minDate', () => {
            expect(v.checkErrors(new Date('2024-01-01'))).toEqual([]);
        });

        it('should accept date after minDate', () => {
            expect(v.checkErrors(new Date('2024-06-01'))).toEqual([]);
        });

        it('should skip check on null', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });

    describe('maxDate', () => {
        const maxDate = new Date('2024-12-31');
        const v = new AlgoDateValidator({ maxDate });

        it('should error when date is after maxDate', () => {
            expect(v.checkErrors(new Date('2025-01-01'))).toContainEqual({ maxDateExceeded: true });
        });

        it('should accept date equal to maxDate', () => {
            expect(v.checkErrors(new Date('2024-12-31'))).toEqual([]);
        });

        it('should accept date before maxDate', () => {
            expect(v.checkErrors(new Date('2024-06-01'))).toEqual([]);
        });

        it('should skip check on null', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });

    describe('minDate and maxDate combined', () => {
        const minDate = new Date('2024-01-01');
        const maxDate = new Date('2024-12-31');
        const v = new AlgoDateValidator({ minDate, maxDate });

        it('should error when below range', () => {
            expect(v.checkErrors(new Date('2023-06-01'))).toContainEqual({ minDateExceeded: true });
        });

        it('should error when above range', () => {
            expect(v.checkErrors(new Date('2025-06-01'))).toContainEqual({ maxDateExceeded: true });
        });

        it('should accept date within range', () => {
            expect(v.checkErrors(new Date('2024-06-15'))).toEqual([]);
        });
    });
});
