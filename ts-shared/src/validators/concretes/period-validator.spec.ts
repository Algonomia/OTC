import { AlgoPeriodValidator } from './period-validator';
import { EPeriodUnit } from '../../interface/period-units.interface';
import { EDayCountType } from '../../interface/day-counts.interface';

describe('AlgoPeriodValidator', () => {
    describe('required', () => {
        const v = new AlgoPeriodValidator({ required: true });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should pass with a valid period', () => {
            expect(v.checkErrors({
                value: 30,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays,
            })).toEqual([]);
        });
    });

    describe('schema validation', () => {
        const v = new AlgoPeriodValidator({});

        it('should reject a period with invalid unit', () => {
            const errors = v.checkErrors({
                value: 30,
                unit: 'InvalidUnit' as any,
                dayCountType: EDayCountType.Default,
            });
            expect(errors).toContainEqual({ invalidPeriod: true });
        });

        it('should reject a period with missing value', () => {
            const errors = v.checkErrors({
                unit: EPeriodUnit.Months,
                dayCountType: EDayCountType.Default,
            } as any);
            expect(errors).toContainEqual({ invalidPeriod: true });
        });

        it('should accept all valid period units', () => {
            for (const unit of Object.values(EPeriodUnit)) {
                expect(v.checkErrors({
                    value: 1,
                    unit,
                    dayCountType: EDayCountType.Default,
                })).toEqual([]);
            }
        });

        it('should skip validation on null (not required)', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });
});
