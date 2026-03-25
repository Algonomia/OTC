import {AValidator, BaseMeta} from '../validators.abstract';
import {NullUndefinedUtils} from '../../utils/null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {EValidatorType} from '../EValidatorType';

export interface RateMeta extends BaseMeta {
    maxRate: number;
}

export class AlgoRateValidator extends AValidator<number | null, RateMeta> {
    readonly validator_type = EValidatorType.rate;

    constructor(meta: RateMeta = {maxRate: 5}) {
        super(meta);

        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
        this.errorCallbacks.push(_between1AndmaxRate.bind(this, meta.maxRate));
    }
}

function _valueRequired(value?: number | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _between1AndmaxRate(maxRate: number, value?: number | null): null | {notRespectedBound: {min: number, max: number}} {
    if (isNullOrUndefined(value)) {
        return null;
    }
    if ((value ?? 0) < 1) {
        return {notRespectedBound: {min: 1, max: maxRate}}
    }
    if ((value ?? 0) > maxRate) {
        return {notRespectedBound: {min: 1, max: maxRate}}
    }
    return null
}
