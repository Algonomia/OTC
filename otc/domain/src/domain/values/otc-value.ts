import {EIndicatorId} from '../indicators/interfaces/interfaces';
import {IOTCBaseSegment, TOTCSegmentSource} from '../segmentations/interface';
import {EObligationTypeId} from '../obligation-type/obligation-type';
import {TSourceViewExt} from '../sources/source-view/source-view';

export interface IOTCValue {
    value?: any;
    reference?: string;
    notes?: string;
    additional_values?: any;
}

export interface IOTCKey {
    key: EIndicatorId;
}

export interface IOTCVersion {
    key: EIndicatorId;
    version: string;
}

export interface IOTCScore {
    judge_llm_score?: number;
}

export interface IOTCDatumId {
    type: 'from_ai' | 'from_user',
    id: number
}

export type TOTCHistorySegment = IOTCBaseSegment & IOTCKey;
export type TOTCValueSegment = TOTCSegmentSource & IOTCKey;

export type TOTCKeyValue = IOTCValue & IOTCDatumId;
export type TOTCDatum = IOTCBaseSegment & TOTCKeyValue & IOTCScore & IOTCVersion;
export type TOTCCreateDatum = TOTCValueSegment &  IOTCValue;
export type TOTCMultiValueCommonSegment = {
    source: TSourceViewExt;
    jurisdiction: string;
    obligation_type_id: EObligationTypeId;
    indicator_ids: EIndicatorId[];
}
