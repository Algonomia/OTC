import { AlgoDayMonthValidator } from './day-month-validator';
import { EMonth } from '../../interface/months.interface';

describe('AlgoDayMonthValidator', () => {
    const v = new AlgoDayMonthValidator({ required: true });

    describe('required', () => {
        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });
    });

    describe('month-specific day limits', () => {
        it('should accept Jan 31', () => {
            expect(v.checkErrors({ day: 31, month: EMonth.January })).toEqual([]);
        });

        it('should reject Feb 30 (February has 28 days)', () => {
            const errors = v.checkErrors({ day: 30, month: EMonth.February });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });

        it('should accept Feb 28', () => {
            expect(v.checkErrors({ day: 28, month: EMonth.February })).toEqual([]);
        });

        it('should reject Feb 29 (no leap year handling — 28 max)', () => {
            const errors = v.checkErrors({ day: 29, month: EMonth.February });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });

        it('should reject Apr 31 (April has 30 days)', () => {
            const errors = v.checkErrors({ day: 31, month: EMonth.April });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });

        it('should accept Apr 30', () => {
            expect(v.checkErrors({ day: 30, month: EMonth.April })).toEqual([]);
        });

        it('should reject day 0', () => {
            const errors = v.checkErrors({ day: 0, month: EMonth.January });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });

        it('should reject negative days', () => {
            const errors = v.checkErrors({ day: -1, month: EMonth.March });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });

        it('should reject day 32 for any month', () => {
            const errors = v.checkErrors({ day: 32, month: EMonth.December });
            expect(errors).toContainEqual({ invalidSubDate: true });
        });
    });
});
