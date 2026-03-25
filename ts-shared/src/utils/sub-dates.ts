import { z } from "zod";
import {EMonth, EMonthExt} from '../interface/months.interface';

export interface IDayMonth {
    day: number;
    month: EMonth;
}

export namespace SubdateUtils {
    export const ZMonth = z.nativeEnum(EMonth);

    export const ZDayMonth = z.object({
        month: ZMonth,
        day: z.number().int().min(1).max(31),
    }).refine(({ month, day }) => {
        const nDays = EMonthExt.getNDayFromId(month);
        return day <= nDays;
    }, {
        message: "Day is invalid for given month",
        path: ["day"]
    })
}
