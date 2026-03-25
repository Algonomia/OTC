import {z, ZodSchema} from 'zod';
import {IBackApiAccessPublicInfo, IBackApiAccessPublicInfoAndSecret, ICreateAccessToken} from './access-token.interface';

const _ZApiAccessPublicInfoSchema = z.object({
    access_key: z.string(),
    last_used_at: z.string().nullable().optional(),
    expires_at: z.string(),
    created_at: z.string(),
});

export const ZApiAccessPublicInfoSchema: ZodSchema<IBackApiAccessPublicInfo> = _ZApiAccessPublicInfoSchema;

export const ZApiAccessPublicInfoAndSecretSchema: ZodSchema<IBackApiAccessPublicInfoAndSecret> = _ZApiAccessPublicInfoSchema.extend({
    access_token: z.string(),
});

export const ZGeneratedKeySchema: ZodSchema<ICreateAccessToken> = z.object({
    expires_at: z.date().nullable(),
});
