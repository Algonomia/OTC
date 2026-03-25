import {IOTCDatumId} from '../../values/otc-value';

export interface ISubmitRate {
    rate: number;
    comment?: string | null;
}

export type TFullSubmitRate = ISubmitRate & IOTCDatumId;
