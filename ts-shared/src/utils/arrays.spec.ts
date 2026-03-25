import {ArrayUtils} from './arrays';

describe('ArrayUtils', () => {
    describe('STANDARD_GENERAL_COMPARATOR', () => {
        it('should_sort_numbers_ascending', () => {
            expect([3, 1, 2].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR)).toEqual([1, 2, 3]);
        });

        it('should_sort_strings_ascending', () => {
            expect(['c', 'a', 'b'].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR)).toEqual(['a', 'b', 'c']);
        });

        it('should_return_zero_for_equal_values', () => {
            expect(ArrayUtils.STANDARD_GENERAL_COMPARATOR(5, 5)).toBe(0);
        });
    });

    describe('STANDARD_GENERAL_COMPARATOR_REVERSE', () => {
        it('should_sort_numbers_descending', () => {
            expect([3, 1, 2].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR_REVERSE)).toEqual([3, 2, 1]);
        });

        it('should_sort_strings_descending', () => {
            expect(['c', 'a', 'b'].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR_REVERSE)).toEqual(['c', 'b', 'a']);
        });
    });

    describe('STANDARD_GENERAL_COMPARATOR_INTL', () => {
        it('should_sort_strings_ascending_with_intl_collation', () => {
            expect(['c', 'a', 'b'].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR_INTL)).toEqual(['a', 'b', 'c']);
        });

        it('should_sort_numbers_ascending_without_intl', () => {
            expect([3, 1, 2].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR_INTL)).toEqual([1, 2, 3]);
        });
    });

    describe('STANDARD_GENERAL_COMPARATOR_INTL_REVERSE', () => {
        it('should_sort_strings_descending_with_intl_collation', () => {
            expect(['c', 'a', 'b'].sort(ArrayUtils.STANDARD_GENERAL_COMPARATOR_INTL_REVERSE)).toEqual(['c', 'b', 'a']);
        });
    });

    describe('STANDARD_GENERAL_ARR_COMPARATOR', () => {
        it('should_sort_arrays_by_first_element_ascending', () => {
            const input = [[3, 1], [1, 2], [2, 3]];
            expect(input.sort(ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR)).toEqual([[1, 2], [2, 3], [3, 1]]);
        });

        it('should_sort_by_second_element_when_first_is_equal', () => {
            const input = [[1, 3], [1, 1], [1, 2]];
            expect(input.sort(ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR)).toEqual([[1, 1], [1, 2], [1, 3]]);
        });

        it('should_sort_shorter_arrays_before_longer_arrays_when_prefix_matches', () => {
            const input = [[1, 2, 3], [1, 2], [1]];
            expect(input.sort(ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR)).toEqual([[1], [1, 2], [1, 2, 3]]);
        });
    });

    describe('STANDARD_GENERAL_ARR_COMPARATOR_REVERSE', () => {
        it('should_sort_arrays_descending', () => {
            const input = [[1, 2], [3, 1], [2, 3]];
            expect(input.sort(ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR_REVERSE)).toEqual([[3, 1], [2, 3], [1, 2]]);
        });
    });

    describe('convertThenSort', () => {
        it('should_sort_by_identity_when_no_convert_func', () => {
            expect(ArrayUtils.convertThenSort([3, 1, 2])).toEqual([1, 2, 3]);
        });

        it('should_sort_by_converted_value', () => {
            const items = [{name: 'b', val: 2}, {name: 'a', val: 1}, {name: 'c', val: 3}];
            const result = ArrayUtils.convertThenSort(items, (x: {name: string; val: number}) => x.val);
            expect(result.map(x => x.name)).toEqual(['a', 'b', 'c']);
        });

        it('should_sort_in_reverse_when_sortMultiplier_is_negative', () => {
            expect(ArrayUtils.convertThenSort([3, 1, 2], (a: number) => a, -1)).toEqual([3, 2, 1]);
        });

        it('should_return_copy_for_single_element_array', () => {
            const input = [42];
            const result = ArrayUtils.convertThenSort(input);
            expect(result).toEqual([42]);
            expect(result).not.toBe(input);
        });

        it('should_return_copy_for_empty_array', () => {
            const input: number[] = [];
            const result = ArrayUtils.convertThenSort(input);
            expect(result).toEqual([]);
            expect(result).not.toBe(input);
        });

        it('should_sort_with_intl_collation_when_enabled', () => {
            expect(ArrayUtils.convertThenSort(['c', 'a', 'b'], (a: string) => a, 1, true)).toEqual(['a', 'b', 'c']);
        });
    });

    describe('convertThenSortWithArrays', () => {
        it('should_sort_by_multi_key_array', () => {
            const items = [
                {group: 2, sub: 1},
                {group: 1, sub: 2},
                {group: 1, sub: 1},
            ];
            const result = ArrayUtils.convertThenSortWithArrays(
                items,
                (x: {group: number; sub: number}) => [x.group, x.sub]
            );
            expect(result).toEqual([
                {group: 1, sub: 1},
                {group: 1, sub: 2},
                {group: 2, sub: 1},
            ]);
        });

        it('should_sort_in_reverse_with_negative_sortMultiplier', () => {
            const items = [{v: 1}, {v: 3}, {v: 2}];
            const result = ArrayUtils.convertThenSortWithArrays(items, (x: {v: number}) => [x.v], -1);
            expect(result).toEqual([{v: 3}, {v: 2}, {v: 1}]);
        });

        it('should_wrap_non_array_convert_result_in_array', () => {
            const items = [3, 1, 2];
            const result = ArrayUtils.convertThenSortWithArrays(items, (x: number) => x);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should_use_identity_when_no_convert_func', () => {
            const items = [3, 1, 2];
            const result = ArrayUtils.convertThenSortWithArrays(items);
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe('convertThenSortFlexible', () => {
        it('should_sort_numbers_by_default', () => {
            expect(ArrayUtils.convertThenSortFlexible([3, 1, 2])).toEqual([1, 2, 3]);
        });

        it('should_sort_strings_using_intl_collation', () => {
            const items = ['c', 'a', 'b'];
            expect(ArrayUtils.convertThenSortFlexible(items, (x: string) => x)).toEqual(['a', 'b', 'c']);
        });

        it('should_use_intl_when_either_value_is_string', () => {
            const items = [{v: '2'}, {v: 1}, {v: '10'}];
            const result = ArrayUtils.convertThenSortFlexible(items, (x: {v: string | number}) => x.v as string | number);
            expect(result.map(x => x.v)).toEqual([1, '10', '2']);
        });

        it('should_sort_in_reverse_with_negative_sortMultiplier', () => {
            expect(ArrayUtils.convertThenSortFlexible([3, 1, 2], (a: number) => a, -1)).toEqual([3, 2, 1]);
        });
    });

    describe('arrRange', () => {
        it('should_generate_inclusive_range', () => {
            expect(ArrayUtils.arrRange(0, 4)).toEqual([0, 1, 2, 3, 4]);
        });

        it('should_return_single_element_when_start_equals_end', () => {
            expect(ArrayUtils.arrRange(3, 3)).toEqual([3]);
        });

        it('should_return_empty_array_when_end_is_less_than_start', () => {
            expect(ArrayUtils.arrRange(5, 2)).toEqual([]);
        });

        it('should_generate_inverse_range', () => {
            expect(ArrayUtils.arrRange(0, 4, true)).toEqual([4, 3, 2, 1, 0]);
        });

        it('should_handle_negative_start', () => {
            expect(ArrayUtils.arrRange(-2, 1)).toEqual([-2, -1, 0, 1]);
        });
    });

    describe('flattenUniques', () => {
        it('should_flatten_nested_arrays_and_deduplicate', () => {
            expect(ArrayUtils.flattenUniques([1, [2, [3, 1]], 2])).toEqual([1, 2, 3]);
        });

        it('should_return_unique_flat_elements', () => {
            expect(ArrayUtils.flattenUniques([1, 1, 2, 2, 3])).toEqual([1, 2, 3]);
        });

        it('should_return_empty_array_for_empty_input', () => {
            expect(ArrayUtils.flattenUniques([])).toEqual([]);
        });

        it('should_handle_deeply_nested_arrays', () => {
            expect(ArrayUtils.flattenUniques([[[['a']]]])).toEqual(['a']);
        });

        it('should_preserve_insertion_order_of_first_occurrences', () => {
            expect(ArrayUtils.flattenUniques([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
        });
    });

    describe('uniques', () => {
        it('should_remove_duplicates', () => {
            expect(ArrayUtils.uniques([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
        });

        it('should_return_empty_array_for_empty_input', () => {
            expect(ArrayUtils.uniques([])).toEqual([]);
        });

        it('should_preserve_order_of_first_occurrences', () => {
            expect(ArrayUtils.uniques([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
        });

        it('should_handle_strings', () => {
            expect(ArrayUtils.uniques(['a', 'b', 'a'])).toEqual(['a', 'b']);
        });
    });

    describe('uniqueValues', () => {
        it('should_extract_and_deduplicate_transformed_values', () => {
            const items = [{id: 1}, {id: 2}, {id: 1}];
            expect(ArrayUtils.uniqueValues(items, x => x.id)).toEqual([1, 2]);
        });

        it('should_return_empty_for_empty_input', () => {
            expect(ArrayUtils.uniqueValues([], (x: unknown) => x)).toEqual([]);
        });

        it('should_deduplicate_string_extractions', () => {
            const items = [{name: 'a'}, {name: 'b'}, {name: 'a'}];
            expect(ArrayUtils.uniqueValues(items, x => x.name)).toEqual(['a', 'b']);
        });
    });

    describe('findIndexWithBinarySearch', () => {
        const cmp = (el: number, target: number) => el - target;

        it('should_find_index_of_existing_element', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([1, 2, 3, 4, 5], 3, cmp)).toBe(2);
        });

        it('should_return_undefined_for_missing_element', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([1, 2, 4, 5], 3, cmp)).toBe(undefined);
        });

        it('should_find_first_element', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([10, 20, 30], 10, cmp)).toBe(0);
        });

        it('should_find_last_element', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([10, 20, 30], 30, cmp)).toBe(2);
        });

        it('should_return_undefined_for_empty_array', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([], 1, cmp)).toBe(undefined);
        });

        it('should_find_in_single_element_array', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([42], 42, cmp)).toBe(0);
        });

        it('should_return_undefined_for_single_element_mismatch', () => {
            expect(ArrayUtils.findIndexWithBinarySearch([42], 99, cmp)).toBe(undefined);
        });
    });

    describe('findWithBinarySearch', () => {
        const cmp = (el: number, target: number) => el - target;

        it('should_return_element_when_found', () => {
            expect(ArrayUtils.findWithBinarySearch([10, 20, 30], 20, cmp)).toBe(20);
        });

        it('should_return_undefined_when_not_found', () => {
            expect(ArrayUtils.findWithBinarySearch([10, 20, 30], 15, cmp)).toBe(undefined);
        });

        it('should_work_with_objects_and_custom_comparator', () => {
            const items = [{id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}];
            const result = ArrayUtils.findWithBinarySearch(items, 2, (el, target) => el.id - target);
            expect(result).toEqual({id: 2, name: 'b'});
        });

        it('should_return_undefined_for_empty_array', () => {
            expect(ArrayUtils.findWithBinarySearch([], 1, cmp)).toBe(undefined);
        });
    });

    describe('includesWithBinarySearch', () => {
        const cmp = (el: number, target: number) => el - target;

        it('should_return_true_when_element_exists', () => {
            expect(ArrayUtils.includesWithBinarySearch([1, 2, 3, 4, 5], 3, cmp)).toBe(true);
        });

        it('should_return_false_when_element_missing', () => {
            expect(ArrayUtils.includesWithBinarySearch([1, 2, 4, 5], 3, cmp)).toBe(false);
        });

        it('should_return_false_for_empty_array', () => {
            expect(ArrayUtils.includesWithBinarySearch([], 1, cmp)).toBe(false);
        });
    });
});
