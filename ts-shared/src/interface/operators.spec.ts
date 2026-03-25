import {OperatorExt, EOperatorId} from './operators';
import {EBaseTypes, EValueType, TComplexValue, INumericConstant, ITagValue} from './complex-value.interface';

function _numericConstant(value: number): INumericConstant {
    return {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value};
}

function _tagValue(code: string, expectedType: EBaseTypes): ITagValue {
    return {type: EValueType.Tag, expected_type: expectedType, value: code};
}

const TAGS = [
    {code: 'salary', viewValue: 'Salary', expected_type: EBaseTypes.Numeric},
    {code: 'name', viewValue: 'Full Name', expected_type: EBaseTypes.String},
];
const SCOPES = [
    {code: 'global', viewValue: 'Global'},
];

const ALL_OPERATOR_IDS = Object.values(EOperatorId);

describe('OperatorExt', () => {
    describe('getAllNonIdentityOperators', () => {
        it('should_contain_an_instance_for_every_id_in_enum', () => {
            const allOps = OperatorExt.getAllAvailables();
            const ids = allOps.map(op => op.id);
            expect(ids).toHaveLength(ALL_OPERATOR_IDS.length);
            ALL_OPERATOR_IDS.forEach(value => {
                expect(ids).toContain(value);
            });
        });

        it('should_return_all_operators_except_identity', () => {
            const result = OperatorExt.getAllNonIdentityOperators();
            const ids = result.map(op => op.id);
            expect(ids).not.toContain(EOperatorId.Identity);
            expect(ids).toHaveLength(ALL_OPERATOR_IDS.length - 1);
        });
    });

    describe('getMinMaxArgs', () => {
        it('should_return_min_1_max_1_for_identity', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.Identity);
            expect(result).toEqual({min_args: 1, max_args: 1});
        });

        it('should_return_min_2_max_undefined_for_add', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.ADD);
            expect(result).toEqual({min_args: 2, max_args: undefined});
        });

        it('should_return_min_2_max_2_for_div', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.DIV);
            expect(result).toEqual({min_args: 2, max_args: 2});
        });

        it('should_return_min_1_max_1_for_not', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.NOT);
            expect(result).toEqual({min_args: 1, max_args: 1});
        });

        it('should_return_min_2_max_undefined_for_if', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.IF);
            expect(result).toEqual({min_args: 2, max_args: undefined});
        });

        it('should_return_min_3_max_3_for_date_from', () => {
            const result = OperatorExt.getMinMaxArgs(EOperatorId.DATE_FROM);
            expect(result).toEqual({min_args: 3, max_args: 3});
        });

        it('should_return_zeros_for_unknown_operator', () => {
            const result = OperatorExt.getMinMaxArgs('nonexistent_operator');
            expect(result).toEqual({min_args: 0, max_args: 0});
        });
    });

    describe('getSymbol', () => {
        it('should_return_empty_string_for_identity', () => {
            expect(OperatorExt.getSymbol(EOperatorId.Identity)).toBe('');
        });

        it('should_return_plus_for_add', () => {
            expect(OperatorExt.getSymbol(EOperatorId.ADD)).toBe('+');
        });

        it('should_return_x_for_mul', () => {
            expect(OperatorExt.getSymbol(EOperatorId.MUL)).toBe('x');
        });

        it('should_return_divide_sign_for_div', () => {
            expect(OperatorExt.getSymbol(EOperatorId.DIV)).toBe('÷');
        });

        it('should_return_exclamation_for_not', () => {
            expect(OperatorExt.getSymbol(EOperatorId.NOT)).toBe('!');
        });

        it('should_return_gt_symbol_for_gt', () => {
            expect(OperatorExt.getSymbol(EOperatorId.GT)).toBe('>');
        });

        it('should_return_empty_string_for_concat', () => {
            expect(OperatorExt.getSymbol(EOperatorId.CONCAT)).toBe('');
        });

        it('should_return_empty_string_for_unknown_operator', () => {
            expect(OperatorExt.getSymbol('nonexistent_operator')).toBe('');
        });
    });

    describe('getTitle', () => {
        it('should_return_identity_for_identity', () => {
            expect(OperatorExt.getTitle(EOperatorId.Identity)).toBe('IDENTITY');
        });

        it('should_return_sum_for_add', () => {
            expect(OperatorExt.getTitle(EOperatorId.ADD)).toBe('Sum');
        });

        it('should_return_multiply_for_mul', () => {
            expect(OperatorExt.getTitle(EOperatorId.MUL)).toBe('Multiply');
        });

        it('should_return_if_else_for_if', () => {
            expect(OperatorExt.getTitle(EOperatorId.IF)).toBe('IF/ELSE');
        });

        it('should_return_concat_for_concat', () => {
            expect(OperatorExt.getTitle(EOperatorId.CONCAT)).toBe('Concat');
        });

        it('should_return_operator_id_string_for_unknown_operator', () => {
            expect(OperatorExt.getTitle('nonexistent_operator')).toBe('nonexistent_operator');
        });

        it('should_return_empty_string_for_undefined', () => {
            expect(OperatorExt.getTitle(undefined)).toBe('');
        });
    });

    describe('displayOperation', () => {
        it('should_display_identity_with_tag_viewValue', () => {
            const arg = _tagValue('salary', EBaseTypes.Numeric);
            const result = OperatorExt.displayOperation(EOperatorId.Identity, TAGS, SCOPES, arg);
            expect(result).toBe('Salary');
        });

        it('should_display_add_with_symbol_separator', () => {
            const a = _numericConstant(3);
            const b = _numericConstant(5);
            const result = OperatorExt.displayOperation(EOperatorId.ADD, TAGS, SCOPES, a, b);
            expect(result).toBe('(3 + 5)');
        });

        it('should_display_mul_with_x_separator', () => {
            const a = _numericConstant(2);
            const b = _numericConstant(4);
            const result = OperatorExt.displayOperation(EOperatorId.MUL, TAGS, SCOPES, a, b);
            expect(result).toBe('(2 x 4)');
        });

        it('should_display_gt_with_symbol', () => {
            const a = _numericConstant(10);
            const b = _numericConstant(5);
            const result = OperatorExt.displayOperation(EOperatorId.GT, TAGS, SCOPES, a, b);
            expect(result).toBe('(10 > 5)');
        });

        it('should_display_if_with_when_then_else', () => {
            const condition: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const thenVal = _numericConstant(1);
            const elseVal = _numericConstant(0);
            const result = OperatorExt.displayOperation(EOperatorId.IF, TAGS, SCOPES, condition, thenVal, elseVal);
            expect(result).toBe('WHEN true THEN 1 ELSE 0');
        });

        it('should_display_concat_with_comma_separator', () => {
            const a: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.String, value: 'hello'};
            const b: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.String, value: 'world'};
            const result = OperatorExt.displayOperation(EOperatorId.CONCAT, TAGS, SCOPES, a, b);
            expect(result).toBe('hello, world');
        });

        it('should_display_abs_with_pipes', () => {
            const a = _numericConstant(5);
            const result = OperatorExt.displayOperation(EOperatorId.ABS, TAGS, SCOPES, a);
            expect(result).toBe('|5|');
        });

        it('should_display_opposite_with_prefix_minus', () => {
            const a = _numericConstant(7);
            const result = OperatorExt.displayOperation(EOperatorId.OPPOSITE, TAGS, SCOPES, a);
            expect(result).toBe('-7');
        });

        it('should_display_inverse_with_prefix', () => {
            const a = _numericConstant(3);
            const result = OperatorExt.displayOperation(EOperatorId.INVERSE, TAGS, SCOPES, a);
            expect(result).toBe('1/3');
        });

        it('should_display_min_with_smallest_of', () => {
            const a = _numericConstant(3);
            const b = _numericConstant(7);
            const result = OperatorExt.displayOperation(EOperatorId.MIN, TAGS, SCOPES, a, b);
            expect(result).toBe('Smallest of: 3, 7');
        });

        it('should_display_max_with_greatest_of', () => {
            const a = _numericConstant(3);
            const b = _numericConstant(7);
            const result = OperatorExt.displayOperation(EOperatorId.MAX, TAGS, SCOPES, a, b);
            expect(result).toBe('Greatest of: 3, 7');
        });

        it('should_display_not_with_exclamation_default_format', () => {
            const a: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const result = OperatorExt.displayOperation(EOperatorId.NOT, TAGS, SCOPES, a);
            expect(result).toBe('!(true)');
        });
    });

    describe('computeExpectedInputs', () => {
        it('should_return_expected_output_type_for_identity_when_provided', () => {
            const op = OperatorExt.getById(EOperatorId.Identity) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric]);
        });

        it('should_return_null_for_identity_when_no_expected_output', () => {
            const op = OperatorExt.getById(EOperatorId.Identity) as OperatorExt;
            const result = op.computeExpectedInputs(undefined);
            expect(result).toEqual([null]);
        });

        it('should_return_numeric_for_all_add_inputs', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            const args = [_numericConstant(1), _numericConstant(2), _numericConstant(3)];
            const result = op.computeExpectedInputs(EBaseTypes.Numeric, ...args);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_minimum_two_numeric_inputs_for_add_with_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_two_numeric_for_div', () => {
            const op = OperatorExt.getById(EOperatorId.DIV) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_boolean_for_not', () => {
            const op = OperatorExt.getById(EOperatorId.NOT) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Boolean);
            expect(result).toEqual([EBaseTypes.Boolean]);
        });

        it('should_return_boolean_and_output_types_for_if_with_two_args', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            const condArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const thenArg = _numericConstant(1);
            const result = op.computeExpectedInputs(EBaseTypes.Numeric, condArg, thenArg);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric]);
        });

        it('should_return_alternating_boolean_and_output_for_if_with_three_args', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            const condArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const thenArg = _numericConstant(1);
            const elseArg = _numericConstant(0);
            const result = op.computeExpectedInputs(EBaseTypes.Numeric, condArg, thenArg, elseArg);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_string_for_all_concat_inputs', () => {
            const op = OperatorExt.getById(EOperatorId.CONCAT) as OperatorExt;
            const a: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.String, value: 'a'};
            const b: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.String, value: 'b'};
            const result = op.computeExpectedInputs(EBaseTypes.String, a, b);
            expect(result).toEqual([EBaseTypes.String, EBaseTypes.String]);
        });

        it('should_return_date_and_day_month_for_next_md_after', () => {
            const op = OperatorExt.getById(EOperatorId.NEXT_MD_AFTER) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Date);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.DayMonth]);
        });

        it('should_return_three_numeric_for_date_from', () => {
            const op = OperatorExt.getById(EOperatorId.DATE_FROM) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Date);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_date_and_period_for_date_add', () => {
            const op = OperatorExt.getById(EOperatorId.DATE_ADD) as OperatorExt;
            const result = op.computeExpectedInputs(EBaseTypes.Date);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.Period]);
        });

        it('should_return_alternating_boolean_numeric_for_sum_when_true', () => {
            const op = OperatorExt.getById(EOperatorId.SUM_WHEN_TRUE) as OperatorExt;
            const condArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const numArg = _numericConstant(5);
            const result = op.computeExpectedInputs(EBaseTypes.Numeric, condArg, numArg);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric]);
        });

        it('should_pad_sum_when_true_to_even_number_of_inputs', () => {
            const op = OperatorExt.getById(EOperatorId.SUM_WHEN_TRUE) as OperatorExt;
            const condArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const numArg = _numericConstant(5);
            const condArg2: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: false};
            const result = op.computeExpectedInputs(EBaseTypes.Numeric, condArg, numArg, condArg2);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric, EBaseTypes.Boolean, EBaseTypes.Numeric]);
        });
    });

    describe('computeExpectedOutput', () => {
        it('should_return_expected_output_for_identity_when_provided', () => {
            const op = OperatorExt.getById(EOperatorId.Identity) as OperatorExt;
            expect(op.computeExpectedOutput(EBaseTypes.Numeric)).toBe(EBaseTypes.Numeric);
        });

        it('should_return_null_for_identity_with_no_output_and_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.Identity) as OperatorExt;
            expect(op.computeExpectedOutput(undefined)).toBeNull();
        });

        it('should_return_numeric_for_add', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            expect(op.computeExpectedOutput(EBaseTypes.Numeric)).toBe(EBaseTypes.Numeric);
        });

        it('should_return_numeric_for_div', () => {
            const op = OperatorExt.getById(EOperatorId.DIV) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.Numeric);
        });

        it('should_return_boolean_for_not', () => {
            const op = OperatorExt.getById(EOperatorId.NOT) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.Boolean);
        });

        it('should_return_boolean_for_gt', () => {
            const op = OperatorExt.getById(EOperatorId.GT) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.Boolean);
        });

        it('should_return_string_for_concat', () => {
            const op = OperatorExt.getById(EOperatorId.CONCAT) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.String);
        });

        it('should_return_date_for_bom', () => {
            const op = OperatorExt.getById(EOperatorId.BOM) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.Date);
        });

        it('should_return_day_month_for_extract_day_month', () => {
            const op = OperatorExt.getById(EOperatorId.EXTRACT_DAY_MONTH) as OperatorExt;
            expect(op.computeExpectedOutput()).toBe(EBaseTypes.DayMonth);
        });

        it('should_return_expected_output_for_if_when_provided', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            expect(op.computeExpectedOutput(EBaseTypes.String)).toBe(EBaseTypes.String);
        });

        it('should_return_null_for_if_when_no_output_and_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            expect(op.computeExpectedOutput(undefined)).toBeNull();
        });

        it('should_infer_type_from_if_then_arg', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            const condArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const thenArg = _numericConstant(42);
            expect(op.computeExpectedOutput(undefined, condArg, thenArg)).toBe(EBaseTypes.Numeric);
        });

        it('should_return_expected_output_for_to_range_when_provided', () => {
            const op = OperatorExt.getById(EOperatorId.TO_RANGE) as OperatorExt;
            expect(op.computeExpectedOutput(EBaseTypes.Date)).toBe(EBaseTypes.Date);
        });

        it('should_return_null_for_to_range_with_no_output_and_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.TO_RANGE) as OperatorExt;
            expect(op.computeExpectedOutput(undefined)).toBeNull();
        });
    });

    describe('computePossibleNextInputs', () => {
        it('should_return_boolean_and_expected_output_for_if', () => {
            const op = OperatorExt.getById(EOperatorId.IF) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric]);
        });

        it('should_return_numeric_as_next_input_for_add_with_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric]);
        });

        it('should_return_numeric_as_next_input_for_add_with_one_arg', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Numeric, _numericConstant(1));
            expect(result).toEqual([EBaseTypes.Numeric]);
        });

        it('should_return_null_for_add_when_args_exceed_computed_inputs', () => {
            const op = OperatorExt.getById(EOperatorId.ADD) as OperatorExt;
            const args = [_numericConstant(1), _numericConstant(2)];
            const expectedInputs = op.computeExpectedInputs(EBaseTypes.Numeric, ...args);
            const result = op.computePossibleNextInputs(EBaseTypes.Numeric, ...args);
            if (args.length >= expectedInputs.length) {
                expect(result).toEqual([null]);
            } else {
                expect(result).toEqual([EBaseTypes.Numeric]);
            }
        });

        it('should_return_boolean_for_not_with_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.NOT) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Boolean);
            expect(result).toEqual([EBaseTypes.Boolean]);
        });

        it('should_return_null_for_not_when_input_filled', () => {
            const op = OperatorExt.getById(EOperatorId.NOT) as OperatorExt;
            const filledArg: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value: true};
            const result = op.computePossibleNextInputs(EBaseTypes.Boolean, filledArg);
            expect(result).toEqual([null]);
        });

        it('should_return_expected_output_type_for_to_range_with_output', () => {
            const op = OperatorExt.getById(EOperatorId.TO_RANGE) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Date);
            expect(result).toEqual([EBaseTypes.Date]);
        });

        it('should_return_multiple_types_for_to_range_with_no_output', () => {
            const op = OperatorExt.getById(EOperatorId.TO_RANGE) as OperatorExt;
            const result = op.computePossibleNextInputs(undefined);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.Numeric, EBaseTypes.Period]);
        });

        it('should_return_date_for_next_md_after_with_no_args', () => {
            const op = OperatorExt.getById(EOperatorId.NEXT_MD_AFTER) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Date);
            expect(result).toEqual([EBaseTypes.Date]);
        });

        it('should_return_day_month_for_next_md_after_with_one_arg', () => {
            const op = OperatorExt.getById(EOperatorId.NEXT_MD_AFTER) as OperatorExt;
            const dateArg = _tagValue('some_date', EBaseTypes.Date);
            const result = op.computePossibleNextInputs(EBaseTypes.Date, dateArg);
            expect(result).toEqual([EBaseTypes.DayMonth]);
        });

        it('should_return_multiple_types_for_extract_day', () => {
            const op = OperatorExt.getById(EOperatorId.EXTRACT_DAY) as OperatorExt;
            const result = op.computePossibleNextInputs(EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.DayMonth]);
        });
    });
});
