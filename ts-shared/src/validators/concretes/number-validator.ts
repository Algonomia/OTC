import {AValidator, BaseMeta} from '../validators.abstract';
import {NullUndefinedUtils} from '../../utils/null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {EValidatorType} from '../EValidatorType';

export interface NumberMeta extends BaseMeta {
    min?: number;
    max?: number;
}

export class AlgoNumberValidator extends AValidator<number | null, NumberMeta> {
    readonly validator_type: EValidatorType = EValidatorType.number;

    constructor(meta: NumberMeta = {}) {
        super(meta);

        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
        if (!isNullOrUndefined(meta.min)) {
            this.errorCallbacks.push(_min.bind(this, meta.min!));
        }
        if (!isNullOrUndefined(meta.max)) {
            this.errorCallbacks.push(_max.bind(this, meta.max!));
        }
    }
}

export class AlgoPercentageValidator extends AlgoNumberValidator {
    readonly validator_type = EValidatorType.bounded_number;

    constructor(meta: BaseMeta) {
        super({...meta, min: 0, max: 100});
    }
}

function _valueRequired(v?: number | null): null | {required: boolean} {
    if (isNullOrUndefined(v)) return {
        required: true
    };
    return null
}

function _min(min: number, v?: number | null): null | {min: {min: number}} {
    if (isNullOrUndefined(v)) {
        return null;
    }
    if (v! < min) {
        return {min: {min: min}}
    }
    return null
}

function _max(max: number, v?: number | null): null | {max: {max: number}} {
    if (isNullOrUndefined(v)) {
        return null;
    }
    if (v! > max) {
        return {max: {max: max}}
    }
    return null
}
