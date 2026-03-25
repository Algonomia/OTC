import {IDayMonth, SubdateUtils} from '../../utils/sub-dates';
import {AValidator, BaseMeta} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';

export interface DayMonthMeta extends BaseMeta {
    placeholder_2?: string;
}

export class AlgoDayMonthValidator extends AValidator<Partial<IDayMonth> | null, DayMonthMeta> {
    readonly validator_type = EValidatorType.day_month;

    constructor(meta: DayMonthMeta = {}) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(_valueRequired)
        }
        this.errorCallbacks.push(_schemaValidator);
    }
}

function _valueRequired(value?: Partial<IDayMonth> | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _schemaValidator(value?: Partial<IDayMonth> | null): {invalidSubDate: true} | null {
    if (!value) {
        return null;
    }
    try {
        SubdateUtils.ZDayMonth.parse(value)
        return null;
    } catch (e) {
        return {invalidSubDate: true};
    }
}
