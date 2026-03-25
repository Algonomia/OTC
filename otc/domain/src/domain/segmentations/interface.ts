import {EObligationTypeId} from '../obligation-type/obligation-type';

export interface IOTCBaseSegment {
    jurisdiction: string;
    obligation_type_id: EObligationTypeId;
}

export type TOTCSegmentSource = IOTCBaseSegment & { source_id: number; }
