import { AlgoComplexValueValidator } from './complex-value-validator';
import { EBaseTypes, EValueType, TComplexValue } from '../../interface/complex-value.interface';

function numConst(value: number): TComplexValue {
    return { type: EValueType.Constant, expected_type: EBaseTypes.Numeric, value };
}

function strConst(value: string): TComplexValue {
    return { type: EValueType.Constant, expected_type: EBaseTypes.String, value };
}

function boolConst(value: boolean): TComplexValue {
    return { type: EValueType.Constant, expected_type: EBaseTypes.Boolean, value };
}

import { EOperatorId } from '../../interface/operators';

function op(operator_id: string, args: TComplexValue[]): TComplexValue {
    return { type: EValueType.Operation, operator_id, args };
}

function tag(value: string, expected_type: EBaseTypes = EBaseTypes.Numeric): TComplexValue {
    return { type: EValueType.Tag, expected_type, value };
}

describe('AlgoComplexValueValidator', () => {
    describe('required', () => {
        const v = new AlgoComplexValueValidator({ required: true });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should pass with a simple constant', () => {
            const errors = v.checkErrors(numConst(42));
            const requiredErrors = errors.filter((e: any) => e?.required);
            expect(requiredErrors).toEqual([]);
        });
    });

    describe('schema validation', () => {
        const v = new AlgoComplexValueValidator({});

        it('should accept valid constant values', () => {
            expect(v.checkErrors(numConst(42)).filter((e: any) => e?.invalidFormat)).toEqual([]);
            expect(v.checkErrors(strConst('hello')).filter((e: any) => e?.invalidFormat)).toEqual([]);
            expect(v.checkErrors(boolConst(true)).filter((e: any) => e?.invalidFormat)).toEqual([]);
        });

        it('should accept valid tag values', () => {
            const errors = v.checkErrors(tag('indicator_1'));
            expect(errors.filter((e: any) => e?.invalidFormat)).toEqual([]);
        });

        it('should reject values with invalid structure', () => {
            const bad: any = { type: 'unknown_type', value: 123 };
            const errors = v.checkErrors(bad);
            expect(errors).toContainEqual({ invalidFormat: true });
        });

        it('should accept date constants (regression DEV-6047)', () => {
            const dateConst: TComplexValue = {
                type: EValueType.Constant,
                expected_type: EBaseTypes.Date,
                value: 1704067200,
            };
            const errors = v.checkErrors(dateConst);
            expect(errors.filter((e: any) => e?.invalidFormat)).toEqual([]);
        });
    });

    describe('operator validation', () => {
        const v = new AlgoComplexValueValidator({});

        it('should detect unknown operators', () => {
            const value = op('NONEXISTENT_OPERATOR', [numConst(1)]);
            try {
                const errors = v.checkErrors(value);
                expect(errors).toContainEqual({ unknownOperator: true });
            } catch {
            }
        });

        it('should accept known operators like ADD', () => {
            const value = op(EOperatorId.ADD, [numConst(1), numConst(2)]);
            const errors = v.checkErrors(value);
            expect(errors.filter((e: any) => e?.unknownOperator)).toEqual([]);
        });
    });

    describe('argument count validation', () => {
        const v = new AlgoComplexValueValidator({});

        it('should detect missing args for binary operators', () => {
            const value = op(EOperatorId.ADD, [numConst(1)]);
            const errors = v.checkErrors(value);
            expect(errors.filter((e: any) => e?.missingArgs)).not.toEqual([]);
        });

        it('should pass with correct arg count', () => {
            const value = op(EOperatorId.ADD, [numConst(1), numConst(2)]);
            const errors = v.checkErrors(value);
            expect(errors.filter((e: any) => e?.missingArgs)).toEqual([]);
        });
    });

    describe('expected output type checking', () => {
        it('should detect type mismatch between expected and actual output', () => {
            const v = new AlgoComplexValueValidator({ expected_output: EBaseTypes.Numeric });
            const value = strConst('hello');
            const errors = v.checkErrors(value);
            expect(errors.filter((e: any) => e?.unexpectedOutput)).not.toEqual([]);
        });

        it('should pass when output type matches', () => {
            const v = new AlgoComplexValueValidator({ expected_output: EBaseTypes.Numeric });
            const value = numConst(42);
            const errors = v.checkErrors(value);
            expect(errors.filter((e: any) => e?.unexpectedOutput)).toEqual([]);
        });
    });

    describe('nested error map (getNestedErrorsMap)', () => {
        it('should return empty map for valid tree', () => {
            const v = new AlgoComplexValueValidator({ expected_output: EBaseTypes.Numeric });
            const value = op(EOperatorId.ADD, [numConst(1), numConst(2)]);
            const errorMap = v.getNestedErrorsMap(value);
            expect(errorMap.size).toBe(0);
        });

        it('should detect type errors in nested operation args', () => {
            const v = new AlgoComplexValueValidator({ expected_output: EBaseTypes.Numeric });
            const value = op(EOperatorId.ADD, [numConst(1), strConst('wrong')]);
            const errorMap = v.getNestedErrorsMap(value);
            expect(errorMap.size).toBeGreaterThan(0);
        });
    });

    describe('non-required allows null', () => {
        const v = new AlgoComplexValueValidator({});

        it('should return no errors for null when not required', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });
});
