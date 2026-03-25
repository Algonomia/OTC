import { SubdateUtils } from './sub-dates';
import { EMonth } from '../interface/months.interface';

describe('SubdateUtils', () => {
    describe('ZMonth', () => {
        it('accepts valid EMonth values', () => {
            Object.values(EMonth).filter(v => typeof v === 'number').forEach(val => {
                expect(SubdateUtils.ZMonth.parse(val)).toBe(val);
            });
        });

        it('rejects invalid values', () => {
            expect(() => SubdateUtils.ZMonth.parse(99)).toThrow();
        });
    });

    describe('ZDayMonth', () => {
        it('accepts a valid day-month', () => {
            const result = SubdateUtils.ZDayMonth.parse({ month: EMonth.January, day: 15 });
            expect(result).toEqual({ month: EMonth.January, day: 15 });
        });

        it('accepts last day of a 31-day month', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.January, day: 31 })).not.toThrow();
        });

        it('rejects day 31 for a 30-day month', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.April, day: 31 })).toThrow();
        });

        it('rejects day 29 for February', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.February, day: 29 })).toThrow();
        });

        it('accepts day 28 for February', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.February, day: 28 })).not.toThrow();
        });

        it('rejects day 0', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.January, day: 0 })).toThrow();
        });

        it('rejects day 32', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.January, day: 32 })).toThrow();
        });

        it('rejects non-integer day', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: EMonth.January, day: 1.5 })).toThrow();
        });

        it('rejects invalid month', () => {
            expect(() => SubdateUtils.ZDayMonth.parse({ month: 99, day: 1 })).toThrow();
        });
    });
});
