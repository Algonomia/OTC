import {
    AlgoMonoListValidator, AlgoMultiListValidator,
    ValidatorGroup
} from '@algonomia/ts-shared';
import {getIndicatorMeta, getJurisdictionMeta, getObligationTypeIdMeta} from './common';
import {TSourceViewExt} from '../../sources/source-view/source-view';
import {TOTCMultiValueCommonSegment} from '../otc-value';

export const get_source_validator = (sources: TSourceViewExt[]) => (new AlgoMonoListValidator({
    required: true,
    list: sources,
    idCallback: ((x: TSourceViewExt) => x.source_id),
    textCallback: ((x: TSourceViewExt) => x.source_name),
    label: 'ObligationDueDateDomain.ValuesValidators.ChooseSource.label',
    placeholder: 'ObligationDueDateDomain.ValuesValidators.ChooseSource.placeholder'
}));

export function get_multi_value_common_segment_validator(source: TSourceViewExt) {
    const jurisdictionMeta = getJurisdictionMeta(source?.jurisdictions);
    const obligationTypeIdMeta = getObligationTypeIdMeta(source?.obligation_types?.map(x => x.id));
    const indicatorMeta = getIndicatorMeta(source?.indicators?.map(x => x.id));
    const otcMultiValueCommonSegmentValidator = new ValidatorGroup<TOTCMultiValueCommonSegment>({
        jurisdiction: new AlgoMonoListValidator(jurisdictionMeta),
        obligation_type_id: new AlgoMonoListValidator(obligationTypeIdMeta),
        indicator_ids: new AlgoMultiListValidator(indicatorMeta)
    });
    return ValidatorGroup.createFromValidatorGroup<TOTCMultiValueCommonSegment>(
        otcMultiValueCommonSegmentValidator
    );
}
