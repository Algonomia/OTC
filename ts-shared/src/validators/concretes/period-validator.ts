import {IPeriod, PeriodUtils} from '../../utils/periods';
import {AValidator, BaseMeta} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';

export interface PeriodMeta extends BaseMeta {
    placeholder_2?: string;
    placeholder_3?: string;
}

export class AlgoPeriodValidator extends AValidator<Partial<IPeriod> | null, PeriodMeta> {
    readonly validator_type = EValidatorType.period;

    constructor(meta: PeriodMeta = {}) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(_valueRequired)
        }
        this.errorCallbacks.push(_schemaValidator);
    }
}

function _valueRequired(value?: Partial<IPeriod> | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _schemaValidator(value?: Partial<IPeriod> | null) {
    if (!value) {
        return null;
    }
    try {
        PeriodUtils.ZPeriod.parse(value)
        return null;
    } catch (e) {
        return {invalidPeriod: true};
    }
}
