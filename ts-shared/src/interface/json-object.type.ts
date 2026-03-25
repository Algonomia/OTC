import z from "zod";

export type TJsonValue = string | number | boolean | null | TJsonObject | TJsonValue[];
export type TJsonObject = { [key: string]: TJsonValue };

export const ZJsonValue: z.ZodType<TJsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        ZJsonObject,
        z.array(ZJsonValue),
    ])
);

export const ZJsonObject: z.ZodType<TJsonObject> = z.lazy(() =>
    z.record(z.string(), ZJsonValue)
);
