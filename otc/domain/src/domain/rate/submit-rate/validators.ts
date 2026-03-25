import {AlgoRateValidator, AlgoStringValidator, ValidatorGroup} from '@algonomia/ts-shared';
import {z, ZodType} from 'zod';
import {TFullSubmitRate, ISubmitRate} from './submit-rate';
import {ZOTCDatumId} from '../../values/validators/zod';

export const ZSubmitRateSchema = z.object({
    rate: z.number(),
    comment: z.string().optional().nullable(),
});

export const ZFullSubmitRateSchema: ZodType<TFullSubmitRate> = ZOTCDatumId.and(ZSubmitRateSchema);

export const submitRateValidator = new ValidatorGroup<ISubmitRate>({
    rate: new AlgoRateValidator({
        required: true,
        label: 'ObligationDueDateDomain.Rate.Rate',
        maxRate: 5
    }),
    comment: new AlgoStringValidator({
        label: 'ObligationDueDateDomain.Rate.Comment',
    })
});

