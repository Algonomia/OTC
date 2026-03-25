import {z} from 'zod';

export interface IOTCRate {
    rate: number;
    comment?: string;
    rated_at: string;
    rated_by: string;
}

export const ZOTCRate: z.ZodType<IOTCRate> = z.object({
    rate: z.number(),
    comment: z.string().optional(),
    rated_at: z.string(),
    rated_by: z.string(),
});
