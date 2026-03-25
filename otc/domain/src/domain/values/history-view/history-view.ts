import {EObligationTypeId} from '../../obligation-type/obligation-type';
import {EIndicatorId} from '../../indicators/interfaces/interfaces';
import {TSourceKeyInfo, TSourceKeyInfoExt} from '../../sources/source-key-info/key-info';

export interface IDatumHistoryView {
    type: 'from_ai' | 'from_user',
    id: number,
    source_id: number,
    jurisdiction: string,
    obligation_type_id: EObligationTypeId,
    version: string,
    key: EIndicatorId,
    value: any,
    additional_values?: any,
    notes: string,
    judge_llm_score?: number,
    reference: string,
    proposed_by: string,
    average_rate: number | null,
    current_user_rate: number | null,
    current_user_comment: string
}

export type TDatumFullHistoryView = IDatumHistoryView & Partial<TSourceKeyInfo>;
export type TDatumFullHistoryViewExt = IDatumHistoryView & Partial<TSourceKeyInfoExt>;
