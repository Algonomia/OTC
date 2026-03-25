import {ComplexValueUtils} from './complex-value';
import {EBaseTypes, EValueType, TComplexValue, TConstantValue, ITagValue, IOperationValue} from '../interface/complex-value.interface';
import {EOperatorId} from '../interface/operators';
import {ITag, IScope} from '../interface/tags';

describe('ComplexValueUtils', () => {
    const TAGS: ITag[] = [
        {code: 'salary', viewValue: 'Salary', expected_type: EBaseTypes.Numeric},
        {code: 'name', viewValue: 'Full Name', expected_type: EBaseTypes.String},
    ];

    const SCOPES: IScope[] = [
        {code: 'global', viewValue: 'Global'},
        {code: 'local', viewValue: 'Local'},
    ];

    describe('display', () => {
        it('should_display_string_constant', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.String,
                value: 'hello',
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('hello');
        });

        it('should_display_numeric_constant_with_unit', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.Numeric,
                value: 42,
                unit: 'EUR',
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('42 EUR');
        });

        it('should_display_numeric_constant_without_unit_or_dimension', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.Numeric,
                value: 7,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('7');
        });

        it('should_display_boolean_constant_true', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.Boolean,
                value: true,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('true');
        });

        it('should_display_boolean_constant_false', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.Boolean,
                value: false,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('false');
        });

        it('should_display_tag_value_with_viewValue', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('Salary');
        });

        it('should_display_tag_value_with_scope', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
                scope: 'global',
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('Salary, Global');
        });

        it('should_display_tag_value_with_years_ago', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
                years_ago: 2,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('Salary, N-2');
        });

        it('should_display_tag_value_with_scope_and_years_ago', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
                scope: 'local',
                years_ago: 1,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('Salary, Local, N-1');
        });

        it('should_display_tag_value_without_scope_nor_years_ago', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
                scope: null,
                years_ago: null,
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('Salary');
        });

        it('should_display_add_operation_with_two_numeric_args', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [
                    {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 1} as TComplexValue,
                    {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 2} as TComplexValue,
                ],
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('(1 + 2)');
        });

        it('should_display_opposite_operation', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.OPPOSITE,
                args: [
                    {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 5} as TComplexValue,
                ],
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('-5');
        });

        it('should_display_abs_operation', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ABS,
                args: [
                    {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: -3} as TComplexValue,
                ],
            };
            expect(ComplexValueUtils.display(value, TAGS, SCOPES)).toBe('|-3|');
        });
    });

    describe('complexValueExpectedOutput', () => {
        it('should_return_null_when_complex_value_is_undefined', () => {
            expect(ComplexValueUtils.complexValueExpectedOutput(undefined)).toBeNull();
        });

        it('should_return_null_when_complex_value_is_undefined_with_expected_output', () => {
            expect(ComplexValueUtils.complexValueExpectedOutput(undefined, EBaseTypes.Numeric)).toBeNull();
        });

        it('should_return_expected_type_for_constant_value', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.String,
                value: 'hello',
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value)).toBe(EBaseTypes.String);
        });

        it('should_return_constant_expected_type_over_fallback', () => {
            const value: TConstantValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.String,
                value: 'hello',
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value, EBaseTypes.Numeric)).toBe(EBaseTypes.String);
        });

        it('should_return_expected_type_for_tag_value', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Numeric,
                value: 'salary',
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value)).toBe(EBaseTypes.Numeric);
        });

        it('should_return_tag_expected_type_over_fallback', () => {
            const value: ITagValue = {
                type: EValueType.Tag,
                expected_type: EBaseTypes.Boolean,
                value: 'flag',
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value, EBaseTypes.String)).toBe(EBaseTypes.Boolean);
        });

        it('should_delegate_to_operator_for_operation_value', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [],
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value)).toBe(EBaseTypes.Numeric);
        });

        it('should_return_boolean_for_comparison_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.GT,
                args: [],
            };
            expect(ComplexValueUtils.complexValueExpectedOutput(value)).toBe(EBaseTypes.Boolean);
        });

        it('should_throw_when_operator_is_unknown', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: 'unknown_op',
                args: [],
            };
            // getByIdOrId returns the raw string for unknown ids, bypassing the null guard
            expect(() => ComplexValueUtils.complexValueExpectedOutput(value)).toThrow();
        });
    });

    describe('operatorValueExpectedInputs', () => {
        it('should_return_numeric_inputs_for_add_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_numeric_inputs_for_add_with_expected_output', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value, EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });

        it('should_return_boolean_inputs_for_and_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.AND,
                args: [],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Boolean]);
        });

        it('should_return_single_boolean_input_for_not_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.NOT,
                args: [],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value);
            expect(result).toEqual([EBaseTypes.Boolean]);
        });

        it('should_throw_for_unknown_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: 'unknown_op',
                args: [],
            };
            // getByIdOrId returns the raw string for unknown ids, bypassing the null guard
            expect(() => ComplexValueUtils.operatorValueExpectedInputs(value)).toThrow();
        });

        it('should_return_date_and_period_inputs_for_date_add', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.DATE_ADD,
                args: [],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.Period]);
        });

        it('should_expand_inputs_for_variadic_operator_with_args', () => {
            const arg1: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 1};
            const arg2: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 2};
            const arg3: TComplexValue = {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 3};
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [arg1, arg2, arg3],
            };
            const result = ComplexValueUtils.operatorValueExpectedInputs(value);
            expect(result).toEqual([EBaseTypes.Numeric, EBaseTypes.Numeric, EBaseTypes.Numeric]);
        });
    });

    describe('operatorValuePossibleNextInputs', () => {
        it('should_return_numeric_for_add_with_no_args', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value);
            expect(result).toEqual([EBaseTypes.Numeric]);
        });

        it('should_return_numeric_for_add_with_one_arg', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.ADD,
                args: [
                    {type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value: 1},
                ],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value);
            expect(result).toEqual([EBaseTypes.Numeric]);
        });

        it('should_throw_for_unknown_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: 'unknown_op',
                args: [],
            };
            // getByIdOrId returns the raw string for unknown ids, bypassing the null guard
            expect(() => ComplexValueUtils.operatorValuePossibleNextInputs(value)).toThrow();
        });

        it('should_return_boolean_for_not_operator_with_no_args', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.NOT,
                args: [],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value);
            expect(result).toEqual([EBaseTypes.Boolean]);
        });

        it('should_return_possible_inputs_for_if_operator', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.IF,
                args: [],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value, EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Boolean, EBaseTypes.Numeric]);
        });

        it('should_return_period_for_date_add_with_one_arg', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.DATE_ADD,
                args: [
                    {type: EValueType.Constant, expected_type: EBaseTypes.Date, value: 0},
                ],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value);
            expect(result).toEqual([EBaseTypes.Period]);
        });

        it('should_return_multiple_types_for_to_range_with_no_expected_output', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.TO_RANGE,
                args: [],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value);
            expect(result).toEqual([EBaseTypes.Date, EBaseTypes.Numeric, EBaseTypes.Period]);
        });

        it('should_return_expected_output_type_for_to_range_with_expected_output', () => {
            const value: IOperationValue = {
                type: EValueType.Operation,
                operator_id: EOperatorId.TO_RANGE,
                args: [],
            };
            const result = ComplexValueUtils.operatorValuePossibleNextInputs(value, EBaseTypes.Numeric);
            expect(result).toEqual([EBaseTypes.Numeric]);
        });
    });

    describe('value_type_title', () => {
        it('should_map_constant_to_Constant', () => {
            expect(ComplexValueUtils.valueTypeTitle[EValueType.Constant]).toBe('Constant');
        });

        it('should_map_operation_to_Operation', () => {
            expect(ComplexValueUtils.valueTypeTitle[EValueType.Operation]).toBe('Operation');
        });

        it('should_map_tag_to_Tag', () => {
            expect(ComplexValueUtils.valueTypeTitle[EValueType.Tag]).toBe('Tag');
        });
    });

    describe('base_type_title', () => {
        it('should_map_string_to_Text', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.String]).toBe('Text');
        });

        it('should_map_numeric_to_Numeric', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.Numeric]).toBe('Numeric');
        });

        it('should_map_boolean_to_True_False', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.Boolean]).toBe('True/False');
        });

        it('should_map_date_to_Date_DD_MM_YYYY', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.Date]).toBe('Date (DD/MM/YYYY)');
        });

        it('should_map_period_to_Period', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.Period]).toBe('Period');
        });

        it('should_map_day_month_to_Date_DD_MM', () => {
            expect(ComplexValueUtils.baseTypeTitle[EBaseTypes.DayMonth]).toBe('Date (DD/MM)');
        });
    });
});
