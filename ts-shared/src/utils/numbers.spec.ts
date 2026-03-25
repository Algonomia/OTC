import {NumberUtils} from './numbers';

describe('NumberUtils', () => {
    describe('isFiniteNumber', () => {
        it('should_return_true_for_zero', () => {
            expect(NumberUtils.isFiniteNumber(0)).toBe(true);
        });

        it('should_return_true_for_positive_integer', () => {
            expect(NumberUtils.isFiniteNumber(42)).toBe(true);
        });

        it('should_return_true_for_negative_integer', () => {
            expect(NumberUtils.isFiniteNumber(-7)).toBe(true);
        });

        it('should_return_true_for_float', () => {
            expect(NumberUtils.isFiniteNumber(3.14)).toBe(true);
        });

        it('should_return_false_for_NaN', () => {
            expect(NumberUtils.isFiniteNumber(NaN)).toBe(false);
        });

        it('should_return_false_for_Infinity', () => {
            expect(NumberUtils.isFiniteNumber(Infinity)).toBe(false);
        });

        it('should_return_false_for_negative_Infinity', () => {
            expect(NumberUtils.isFiniteNumber(-Infinity)).toBe(false);
        });

        it('should_return_false_for_string', () => {
            expect(NumberUtils.isFiniteNumber('42')).toBe(false);
        });

        it('should_return_false_for_null', () => {
            expect(NumberUtils.isFiniteNumber(null)).toBe(false);
        });

        it('should_return_false_for_undefined', () => {
            expect(NumberUtils.isFiniteNumber(undefined)).toBe(false);
        });

        it('should_return_false_for_boolean', () => {
            expect(NumberUtils.isFiniteNumber(true)).toBe(false);
        });

        it('should_return_false_for_object', () => {
            expect(NumberUtils.isFiniteNumber({})).toBe(false);
        });

        it('should_return_false_for_array', () => {
            expect(NumberUtils.isFiniteNumber([])).toBe(false);
        });
    });

    describe('isNotFiniteNumber', () => {
        it('should_return_false_for_zero', () => {
            expect(NumberUtils.isNotFiniteNumber(0)).toBe(false);
        });

        it('should_return_false_for_positive_integer', () => {
            expect(NumberUtils.isNotFiniteNumber(42)).toBe(false);
        });

        it('should_return_false_for_negative_float', () => {
            expect(NumberUtils.isNotFiniteNumber(-3.14)).toBe(false);
        });

        it('should_return_true_for_NaN', () => {
            expect(NumberUtils.isNotFiniteNumber(NaN)).toBe(true);
        });

        it('should_return_true_for_Infinity', () => {
            expect(NumberUtils.isNotFiniteNumber(Infinity)).toBe(true);
        });

        it('should_return_true_for_negative_Infinity', () => {
            expect(NumberUtils.isNotFiniteNumber(-Infinity)).toBe(true);
        });

        it('should_return_true_for_string', () => {
            expect(NumberUtils.isNotFiniteNumber('42')).toBe(true);
        });

        it('should_return_true_for_null', () => {
            expect(NumberUtils.isNotFiniteNumber(null)).toBe(true);
        });

        it('should_return_true_for_undefined', () => {
            expect(NumberUtils.isNotFiniteNumber(undefined)).toBe(true);
        });

        it('should_return_true_for_object', () => {
            expect(NumberUtils.isNotFiniteNumber({})).toBe(true);
        });
    });

    describe('toFixedNumber', () => {
        it('should_return_value_unchanged_when_precision_is_undefined', () => {
            expect(NumberUtils.toFixedNumber(3.14159)).toBe(3.14159);
        });

        it('should_round_to_zero_decimal_places', () => {
            expect(NumberUtils.toFixedNumber(3.7, 0)).toBe(4);
        });

        it('should_round_to_two_decimal_places', () => {
            expect(NumberUtils.toFixedNumber(3.14159, 2)).toBe(3.14);
        });

        it('should_round_up_at_midpoint', () => {
            expect(NumberUtils.toFixedNumber(2.555, 2)).toBe(2.56);
        });

        it('should_handle_integer_input_with_precision', () => {
            expect(NumberUtils.toFixedNumber(5, 3)).toBe(5);
        });

        it('should_handle_negative_numbers', () => {
            expect(NumberUtils.toFixedNumber(-3.14159, 2)).toBe(-3.14);
        });

        it('should_handle_zero', () => {
            expect(NumberUtils.toFixedNumber(0, 5)).toBe(0);
        });
    });
});
