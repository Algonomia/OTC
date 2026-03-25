import {EPeriodUnit, EPeriodUnitExt} from './period-units.interface';

const ALL_ENUM_VALUES = Object.values(EPeriodUnit);

describe('EPeriodUnitExt', () => {
    describe('getAllIds', () => {
        it('should_contain_an_instance_for_every_id_in_enum', () => {
            const ids = EPeriodUnitExt.getAllIds();
            expect(ids).toHaveLength(ALL_ENUM_VALUES.length);
            ALL_ENUM_VALUES.forEach(value => {
                expect(ids).toContain(value);
            });
        });
    });

    describe('getTitleFromId', () => {
        it('should_return_non_empty_title_for_every_enum_value', () => {
            ALL_ENUM_VALUES.forEach(id => {
                const title = EPeriodUnitExt.getTitleFromId(id);
                expect(title).toBeTruthy();
            });
        });

        it('should_return_id_for_unknown_id', () => {
            expect(EPeriodUnitExt.getTitleFromId('unknown' as EPeriodUnit)).toBe('unknown');
        });
    });

    describe('getTmpTitleFromId', () => {
        it('should_return_non_empty_tmp_title_for_every_enum_value', () => {
            ALL_ENUM_VALUES.forEach(id => {
                const title = EPeriodUnitExt.getTmpTitleFromId(id);
                expect(title).toBeTruthy();
            });
        });

        it('should_return_id_for_unknown_id', () => {
            expect(EPeriodUnitExt.getTmpTitleFromId('unknown' as EPeriodUnit)).toBe('unknown');
        });
    });
});
