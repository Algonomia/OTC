import { z } from "zod";
import { TUser } from "./user.interface";

export const ZLinkedInUserSchema = z.object({
    id: z.string(),
    firstname: z.string().min(2),
    lastname: z.string().min(2),
    email: z.string(),
    email_verified: z.boolean(),
    country: z.string().length(2),
    language: z.string().length(2),
    picture: z.string()
});

export const ZUserCGUSchema = z.object({
    job: z.string().nullable(),
    company: z.string().nullable(),
    phone: z.string().nullable(),
    cgu: z.boolean()
});

export const ZUserManualUpdateSchema = z.object({
    job: z.string().nullable(),
    company: z.string().nullable(),
    phone: z.string().nullable(),
    pro_email: z.string().nullable()
});

export const ZPartialUserManualUpdateSchema = ZUserManualUpdateSchema.partial();

export const ZUserSchema: z.ZodType<TUser> = ZLinkedInUserSchema
    .merge(ZUserCGUSchema)
    .merge(ZUserManualUpdateSchema);
