import {ComplexValueUtils} from '../../utils/complex-value';
import {AValidator, BaseMeta, ValidatorError} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';
import {EBaseTypes, EValueType, TComplexValue} from '../../interface/complex-value.interface';
import {IScope, ITag} from '../../interface/tags';
import {OperatorExt} from '../../interface/operators';
import {EValidatorErrors} from '../errors.abstract';
import {ObjectUtils} from '../../utils/object-utils';

export interface ComplexValueMeta extends BaseMeta {
    tag_list?: ITag[];
    scope_list?: IScope[];
    expected_output?: EBaseTypes | null;
}

export class AlgoComplexValueValidator extends AValidator<TComplexValue | null, ComplexValueMeta> {
    readonly validator_type = EValidatorType.complex_value;

    constructor(meta: ComplexValueMeta = {}) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
        this.errorCallbacks.push(
            _equationSchemaValidator,
            _unknownOperatorValidator,
            _minArgsValidator,
            _maxArgsValidator,
            _unexpectedInputs.bind(this, meta.expected_output ?? null),
            _unexpectedOutput.bind(this, meta.expected_output ?? null),
            _invalidNestedValues.bind(this, meta.expected_output ?? null, meta.tag_list ?? [], meta.scope_list ?? [])
        );
    }

    getNestedErrorsMap(value: TComplexValue): Map<TComplexValue, ValidatorError> {
        const errors = this.checkErrors(value);

        if (!errors?.length) {
            return new Map();
        }

        return this._buildErrorMap(value, errors);
    }

    private _buildErrorMap(rootValue: TComplexValue, errors: ValidatorError[]): Map<TComplexValue, ValidatorError> {
        const pathErrors = this._flattenErrorPaths(errors);
        const errorMap = new Map<TComplexValue, ValidatorError>();

        for (const { path, errors: pathErrorList } of pathErrors) {
            if (pathErrorList.length === 0) {
                continue;
            }
            const nestedValue = this._getValueAtPath(rootValue, path);
            const mergedErrors: ValidatorError = ObjectUtils.fuseObjects(...pathErrorList.filter(x => x !== null));
            if (nestedValue) {
                errorMap.set(nestedValue, mergedErrors);
            }
        }

        return errorMap;
    }

    private _getValueAtPath(value: TComplexValue, path: number[]): TComplexValue | null {
        let current = value;

        for (const index of path) {
            if (current.type !== EValueType.Operation) {
                continue;
            }
            const args = current.args;
            if (!args || index >= args.length) {
                return null;
            }
            current = args[index];
        }

        return current;
    }

    private _flattenErrorPaths(errors: ValidatorError[], currentPath: number[] = []): Array<{ path: number[]; errors: ValidatorError[] }> {
        const result: Array<{ path: number[]; errors: ValidatorError[] }> = [];

        result.push({ path: currentPath, errors });

        for (const error of errors) {
            if (!error) continue;

            const nestedInputErrors = error[EValidatorErrors.invalidNestedInputs] ?? [];

            for (const { errors: nestedErrors, position } of nestedInputErrors) {
                const nestedPath = [...currentPath, position];
                result.push(...this._flattenErrorPaths(nestedErrors, nestedPath));
            }
        }

        return result;
    }
}

function _valueRequired(value?: TComplexValue | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _equationSchemaValidator(value?: TComplexValue | null) {
    if (!value) {
        return null;
    }
    try {
        ComplexValueUtils.ZComplexValue.parse(value)
        return null;
    } catch (e) {
        return {invalidFormat: true};
    }
}

function _unknownOperatorValidator(value?: TComplexValue | null) {
    if (!value || value.type !== EValueType.Operation) {
        return null;
    }
    try {
        const operator = value.operator_id;
        const operatorExt = OperatorExt.getById(operator);
        if (!operatorExt) {
            return {unknownOperator: true};
        }
        return null;
    } catch (e) {
        return {unknownOperator: true};
    }
}

function _minArgsValidator(value?: TComplexValue | null) {
    if (!value || value.type !== EValueType.Operation) {
        return null;
    }
    const operatorId = value.operator_id;
    const minMax = OperatorExt.getMinMaxArgs(operatorId);
    const nArgs = value?.args?.length ?? 0;
    if (nArgs < minMax.min_args) {
        return {missingArgs: {nMissing: minMax.min_args - nArgs}};
    }
    return null;
}

function _maxArgsValidator(value?: TComplexValue | null) {
    if (!value || value.type !== EValueType.Operation) {
        return null;
    }
    const operatorId = value.operator_id;
    const minMax = OperatorExt.getMinMaxArgs(operatorId);
    if (!minMax.max_args) {
        return null;
    }
    const nArgs = value?.args?.length ?? 0;
    if (nArgs > minMax.max_args) {
        return {overflowingArgs: {nOverflowing: nArgs}};
    }
    return null;
}

function _unexpectedInputs(expected_output?: null | EBaseTypes, value?: TComplexValue | null) {
    if (!value || value.type !== EValueType.Operation) {
        return null;
    }
    const inputs = ComplexValueUtils.operatorValueExpectedInputs(value, expected_output);
    const args = value?.args ?? [];
    const argsExpectedOutputs = args.map(
        (x, i) => ComplexValueUtils.complexValueExpectedOutput(x, inputs[i])
    );
    const wrongInputPosition = inputs.map(
        (x, i) => x !== argsExpectedOutputs[i] ? i : undefined
    ).filter(x => x !== undefined);
    if (wrongInputPosition.length === 0) {
        return null;
    }
    return {wrongInputs: {positions: wrongInputPosition.join(', ')}};
}

function _unexpectedOutput(expected_output?: null | EBaseTypes, value?: TComplexValue | null) {
    if (!expected_output || !value) {
        return null;
    }
    const output = ComplexValueUtils.complexValueExpectedOutput(value, expected_output);
    if (expected_output !== output) {
        return {unexpectedOutput: {expected_output, output}};
    }
    return null;
}

function _invalidNestedValues(
    expected_output: EBaseTypes | null,
    tag_list: ITag[],
    scope_list: IScope[],
    value?: TComplexValue | null
): { invalidNestedInputs: { position: number, errors: ValidatorError[] }[] } | null {
    if (!value) {
        return null;
    }

    if (value.type !== EValueType.Operation) {
        return null;
    }

    const expectedInputs = ComplexValueUtils.operatorValueExpectedInputs(value, expected_output);
    const nestedInputErrors: { position: number, errors: ValidatorError[] }[] = [];

    const args = value?.args ?? [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const expectedInput = expectedInputs[i];

        const validator = new AlgoComplexValueValidator({ expected_output: expectedInput, tag_list: tag_list, scope_list: scope_list });
        const nestedErrors = validator.checkErrors(arg);
        if (!nestedErrors?.length) {
            continue;
        }
        nestedInputErrors.push({ position: i, errors: nestedErrors });
    }

    if (!nestedInputErrors?.length) {
        return null;
    }
    return {invalidNestedInputs: nestedInputErrors};
}
