import {EMonth, EMonthExt} from './months.interface';

const ALL_ENUM_VALUES = Object.values(EMonth).filter((v): v is EMonth => typeof v === 'number');

describe('EMonthExt', () => {
    describe('getAllIds', () => {
        it('should_contain_an_instance_for_every_id_in_enum', () => {
            const ids = EMonthExt.getAllIds();
            expect(ids).toHaveLength(ALL_ENUM_VALUES.length);
            ALL_ENUM_VALUES.forEach(value => {
                expect(ids).toContain(value);
            });
        });
    });

    describe('getNDayFromId', () => {
        it('should_return_positive_day_count_for_every_enum_value', () => {
            ALL_ENUM_VALUES.forEach(id => {
                expect(EMonthExt.getNDayFromId(id)).toBeGreaterThan(0);
            });
        });

        it('should_return_0_for_undefined', () => {
            expect(EMonthExt.getNDayFromId(undefined)).toBe(0);
        });

        it('should_return_0_for_unknown_id', () => {
            expect(EMonthExt.getNDayFromId(99 as EMonth)).toBe(0);
        });
    });

    describe('getMaxDayFromId', () => {
        it('should_return_positive_max_day_for_every_enum_value', () => {
            ALL_ENUM_VALUES.forEach(id => {
                expect(EMonthExt.getMaxDayFromId(id)).toBeGreaterThan(0);
            });
        });

        it('should_return_31_for_undefined', () => {
            expect(EMonthExt.getMaxDayFromId(undefined)).toBe(31);
        });

        it('should_return_31_for_unknown_id', () => {
            expect(EMonthExt.getMaxDayFromId(99 as EMonth)).toBe(31);
        });
    });

    describe('getTitleFromId', () => {
        it('should_return_non_empty_title_for_every_enum_value', () => {
            ALL_ENUM_VALUES.forEach(id => {
                expect(EMonthExt.getTitleFromId(id)).toBeTruthy();
            });
        });

        it('should_return_empty_string_for_unknown_id', () => {
            expect(EMonthExt.getTitleFromId(99 as EMonth)).toBe('');
        });
    });
});
