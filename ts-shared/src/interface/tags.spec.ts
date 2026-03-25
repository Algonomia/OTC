import {TagUtils, ITag, IScope} from './tags';
import {EBaseTypes} from './complex-value.interface';

describe('TagUtils', () => {
    describe('getViewValueFromCode', () => {
        const TAGS: ITag[] = [
            {code: 'salary', viewValue: 'Salary', expected_type: EBaseTypes.Numeric},
            {code: 'name', viewValue: 'Full Name', expected_type: EBaseTypes.String},
        ];

        const SCOPES: IScope[] = [
            {code: 'global', viewValue: 'Global'},
            {code: 'local', viewValue: 'Local'},
        ];

        it('should_return_viewValue_for_matching_tag_code', () => {
            expect(TagUtils.getViewValueFromCode(TAGS, 'salary')).toBe('Salary');
        });

        it('should_return_viewValue_for_matching_scope_code', () => {
            expect(TagUtils.getViewValueFromCode(SCOPES, 'global')).toBe('Global');
        });

        it('should_return_code_when_no_match_found', () => {
            expect(TagUtils.getViewValueFromCode(TAGS, 'unknown')).toBe('unknown');
        });

        it('should_return_empty_string_for_null_code', () => {
            expect(TagUtils.getViewValueFromCode(TAGS, null)).toBe('');
        });

        it('should_return_empty_string_for_undefined_code', () => {
            expect(TagUtils.getViewValueFromCode(TAGS, undefined)).toBe('');
        });

        it('should_return_empty_string_for_empty_string_code', () => {
            expect(TagUtils.getViewValueFromCode(TAGS, '')).toBe('');
        });

        it('should_return_empty_string_for_empty_list', () => {
            expect(TagUtils.getViewValueFromCode([], 'salary')).toBe('salary');
        });
    });
});
