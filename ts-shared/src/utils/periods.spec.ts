import { PeriodUtils } from './periods';
import { EPeriodUnit } from '../interface/period-units.interface';
import { EDayCountType } from '../interface/day-counts.interface';

describe('PeriodUtils', () => {
    describe('ZDayCountType', () => {
        it('accepts valid EDayCountType values', () => {
            Object.values(EDayCountType).forEach(val => {
                expect(PeriodUtils.ZDayCountType.parse(val)).toBe(val);
            });
        });

        it('rejects invalid values', () => {
            expect(() => PeriodUtils.ZDayCountType.parse('invalid')).toThrow();
        });
    });

    describe('ZPeriodUnit', () => {
        it('accepts valid EPeriodUnit values', () => {
            Object.values(EPeriodUnit).forEach(val => {
                expect(PeriodUtils.ZPeriodUnit.parse(val)).toBe(val);
            });
        });

        it('rejects invalid values', () => {
            expect(() => PeriodUtils.ZPeriodUnit.parse('invalid')).toThrow();
        });
    });

    describe('ZPeriod', () => {
        it('accepts a valid period object', () => {
            const period = {
                value: 30,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays,
            };
            expect(PeriodUtils.ZPeriod.parse(period)).toEqual(period);
        });

        it('rejects missing value', () => {
            expect(() => PeriodUtils.ZPeriod.parse({
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays,
            })).toThrow();
        });

        it('rejects invalid unit', () => {
            expect(() => PeriodUtils.ZPeriod.parse({
                value: 30,
                unit: 'invalid',
                dayCountType: EDayCountType.CalendarDays,
            })).toThrow();
        });

        it('rejects invalid dayCountType', () => {
            expect(() => PeriodUtils.ZPeriod.parse({
                value: 30,
                unit: EPeriodUnit.Days,
                dayCountType: 'invalid',
            })).toThrow();
        });
    });
});
