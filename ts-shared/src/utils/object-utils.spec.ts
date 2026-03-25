import {ObjectUtils} from './object-utils';
import {TJsonObject, TJsonValue} from '../interface/json-object.type';

describe('ObjectUtils', () => {
    describe('isObject', () => {
        it('should_return_true_for_plain_object', () => {
            expect(ObjectUtils.isObject({a: 1})).toBe(true);
        });

        it('should_return_true_for_empty_object', () => {
            expect(ObjectUtils.isObject({})).toBe(true);
        });

        it('should_return_true_for_array', () => {
            expect(ObjectUtils.isObject([1, 2])).toBe(true);
        });

        it('should_return_true_for_date', () => {
            expect(ObjectUtils.isObject(new Date())).toBe(true);
        });

        it('should_return_false_for_null', () => {
            expect(ObjectUtils.isObject(null)).toBe(false);
        });

        it('should_return_false_for_undefined', () => {
            expect(ObjectUtils.isObject(undefined)).toBe(false);
        });

        it('should_return_false_for_string', () => {
            expect(ObjectUtils.isObject('hello')).toBe(false);
        });

        it('should_return_false_for_number', () => {
            expect(ObjectUtils.isObject(42)).toBe(false);
        });

        it('should_return_false_for_boolean', () => {
            expect(ObjectUtils.isObject(true)).toBe(false);
        });
    });

    describe('deepCopy', () => {
        it('should_return_null_for_null_input', () => {
            expect(ObjectUtils.deepCopy(null)).toBe(null);
        });

        it('should_return_null_for_undefined_input', () => {
            expect(ObjectUtils.deepCopy(undefined)).toBe(null);
        });

        it('should_copy_string_as_is', () => {
            expect(ObjectUtils.deepCopy('hello')).toBe('hello');
        });

        it('should_copy_number_as_is', () => {
            expect(ObjectUtils.deepCopy(42)).toBe(42);
        });

        it('should_copy_boolean_as_is', () => {
            expect(ObjectUtils.deepCopy(true)).toBe(true);
        });

        it('should_deep_copy_flat_object', () => {
            const original = {a: 1, b: 'two'};
            const copy = ObjectUtils.deepCopy(original);
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
        });

        it('should_deep_copy_nested_object', () => {
            const original = {a: {b: {c: 3}}};
            const copy = ObjectUtils.deepCopy(original);
            expect(copy).toEqual(original);
            expect((copy as TJsonObject).a).not.toBe(original.a);
            expect(((copy as TJsonObject).a as TJsonObject).b).not.toBe(original.a.b);
        });

        it('should_deep_copy_array', () => {
            const original = [1, 2, [3, 4]];
            const copy = ObjectUtils.deepCopy(original);
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
            expect((copy as TJsonValue[])[2]).not.toBe(original[2]);
        });

        it('should_deep_copy_object_with_array_values', () => {
            const original = {items: [1, 2, 3], nested: {arr: [4, 5]}};
            const copy = ObjectUtils.deepCopy(original);
            expect(copy).toEqual(original);
            expect((copy as TJsonObject).items).not.toBe(original.items);
            expect(((copy as TJsonObject).nested as TJsonObject).arr).not.toBe(original.nested.arr);
        });

        it('should_not_mutate_original_when_copy_is_modified', () => {
            const original = {a: {b: 1}};
            const copy = ObjectUtils.deepCopy(original) as TJsonObject;
            (copy.a as TJsonObject).b = 999;
            expect(original.a.b).toBe(1);
        });
    });

    describe('fuseObjects', () => {
        it('should_return_empty_object_when_no_arguments', () => {
            expect(ObjectUtils.fuseObjects()).toEqual({});
        });

        it('should_return_copy_of_single_object', () => {
            const obj = {a: 1, b: 2};
            const result = ObjectUtils.fuseObjects(obj);
            expect(result).toEqual(obj);
            expect(result).not.toBe(obj);
        });

        it('should_merge_two_non_overlapping_objects', () => {
            expect(ObjectUtils.fuseObjects({a: 1}, {b: 2})).toEqual({a: 1, b: 2});
        });

        it('should_override_earlier_keys_with_later_keys', () => {
            expect(ObjectUtils.fuseObjects({a: 1, b: 2}, {b: 3, c: 4})).toEqual({a: 1, b: 3, c: 4});
        });

        it('should_merge_multiple_objects_in_order', () => {
            expect(ObjectUtils.fuseObjects({a: 1}, {b: 2}, {c: 3})).toEqual({a: 1, b: 2, c: 3});
        });

        it('should_last_value_wins_across_multiple_objects', () => {
            expect(ObjectUtils.fuseObjects({x: 1}, {x: 2}, {x: 3})).toEqual({x: 3});
        });
    });
});
