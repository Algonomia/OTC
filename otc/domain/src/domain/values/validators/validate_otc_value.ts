import {
    AlgoMonoListValidator,
    AlgoObjectValidator,
    AlgoStringValidator,
    ValidatorGroup
} from '@algonomia/ts-shared';
import {TOTCCreateDatum, IOTCValue, TOTCValueSegment} from '../otc-value';
import {getIndicatorMeta, getJurisdictionMeta, getObligationTypeIdMeta} from './common';
import {Indicator, EIndicatorId} from '../../indicators/interfaces/interfaces';
import {ObligationType, EObligationTypeId} from '../../obligation-type/obligation-type';

const _otcValueValidator = new ValidatorGroup<TOTCValueSegment>({
    jurisdiction: new AlgoMonoListValidator(getJurisdictionMeta()),
    obligation_type_id: new AlgoMonoListValidator(getObligationTypeIdMeta()),
    key: new AlgoMonoListValidator(getIndicatorMeta())
});

export function get_value_validator(obligationTypeId: EObligationTypeId, indicatorId: EIndicatorId) {
    const indicator: Indicator = Indicator.getById(indicatorId) as Indicator;
    const obligation: ObligationType = ObligationType.getById(obligationTypeId) as ObligationType;
    const subObligations = obligation.sub_obligation_ids;
    const subObligationTitlesMap = new Map(subObligations.map(x => [x, ObligationType.getText(x)]));
    const additionalValuesValidator = new Map(subObligations.map(subObligation => [subObligation, indicator?.getSubObligationValidator(subObligation)]));

    return new ValidatorGroup<IOTCValue>({
        value: indicator?.validator,
        additional_values: new AlgoObjectValidator({
            mapKeyValidator: additionalValuesValidator,
            mapKeyTitles: subObligationTitlesMap,
            required: false,
            label: 'ObligationDueDateDomain.ValuesValidators.AdditionalValues'
        }),
        notes: new AlgoStringValidator({label: indicator?.notes_text, required: false}),
        reference: new AlgoStringValidator({label: indicator?.refs_text, required: false})
    });
}

export function get_check_datum_validator(obligationTypeId: EObligationTypeId, indicator: EIndicatorId) {
    return ValidatorGroup.createFromValidatorGroup<TOTCCreateDatum>(_otcValueValidator, get_value_validator(obligationTypeId, indicator));
}
