import {EIndicatorId} from '../indicators/interfaces/interfaces';
import {TOTCKeyValue} from '../values/otc-value';
import {IOTCBaseSegment} from '../segmentations/interface';

export type TValueLine = IOTCBaseSegment & Partial<{[key in EIndicatorId]: TOTCKeyValue}>;
