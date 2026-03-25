import {EObligationTypeId} from '../../obligation-type/obligation-type';
import {EIndicatorId} from '../../indicators/interfaces/interfaces';
import {TSourceKeyInfo, TSourceKeyInfoExt} from '../../sources/source-key-info/key-info';
import {EValuesStatus} from '../values-status';

export interface IDatumContributionView {
    id: number,
    source_id: number,
    jurisdiction: string,
    obligation_type_id: EObligationTypeId,
    version: string,
    key: EIndicatorId,
    value: any,
    additional_values: any,
    notes: string,
    reference: string,
    proposed_by: string,
    status: EValuesStatus,
    admin_comment: string
}

export type TDatumFullContributionView = IDatumContributionView & Partial<TSourceKeyInfo>;
export type TDatumFullContributionViewExt = IDatumContributionView & Partial<TSourceKeyInfoExt>;
