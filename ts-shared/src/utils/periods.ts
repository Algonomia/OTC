import { z } from "zod";
import {EPeriodUnit} from '../interface/period-units.interface';
import {EDayCountType} from '../interface/day-counts.interface';

export interface IPeriod {
    value: number;
    unit: EPeriodUnit;
    dayCountType: EDayCountType;
}

export namespace PeriodUtils {
    export const ZDayCountType = z.nativeEnum(EDayCountType);
    export const ZPeriodUnit = z.nativeEnum(EPeriodUnit);
    export const ZPeriod: z.ZodType<IPeriod> = z.object({
        value: z.number(),
        unit: ZPeriodUnit,
        dayCountType: ZDayCountType
    });
}
