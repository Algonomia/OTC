import {AValidator, BaseMeta} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';

export interface DateMeta extends BaseMeta {
    minDate?: Date;
    maxDate?: Date;
    with_time?: boolean;
}

export class AlgoDateValidator extends AValidator<Date | null, DateMeta> {
    readonly validator_type = EValidatorType.date;

    constructor(meta: DateMeta = {}) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
        if (meta.minDate) {
            this.errorCallbacks.push(_minDateValidator.bind(this, meta.minDate));
        }
        if (meta.maxDate) {
            this.errorCallbacks.push(_maxDateValidator.bind(this, meta.maxDate));
        }
    }
}

function _valueRequired(value?: Date | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _minDateValidator(minDate: Date, value?: Date | null) {
    if (!value) {
        return null;
    }
    if (value < minDate) {
        return {minDateExceeded: true}
    }
    return null;
}

function _maxDateValidator(maxDate: Date, value?: Date | null) {
    if (!value) {
        return null;
    }
    if (value > maxDate) {
        return {maxDateExceeded: true}
    }
    return null;
}
