import {z} from "zod";
import {IPeriod, PeriodUtils} from './periods';
import {IDayMonth, SubdateUtils} from './sub-dates';
import {
    EBaseTypes,
    EValueType,
    TComplexValue,
    TConstantValue,
    INumericConstant, IOperationValue
} from '../interface/complex-value.interface';
import {OperatorExt} from '../interface/operators';
import {EDayCountType, EDayCountTypeExt} from '../interface/day-counts.interface';
import {EPeriodUnitExt} from '../interface/period-units.interface';
import {DateUtils} from './dates';
import {IScope, ITag, TagUtils} from '../interface/tags';

export namespace ComplexValueUtils {
    export const valueTypeTitle: {[key in EValueType]: string} = {
        [EValueType.Constant]: 'Constant',
        [EValueType.Operation]: 'Operation',
        [EValueType.Tag]: 'Tag',
    }

    export const baseTypeTitle: {[key in EBaseTypes]: string} = {
        [EBaseTypes.String]: 'Text',
        [EBaseTypes.Date]: 'Date (DD/MM/YYYY)',
        [EBaseTypes.Numeric]: 'Numeric',
        [EBaseTypes.Boolean]: 'True/False',
        [EBaseTypes.Period]: 'Period',
        [EBaseTypes.DayMonth]: 'Date (DD/MM)',
    }

    export function display(complexValue: TComplexValue, tagList: ITag[], scopeList: IScope[]) {
        switch (complexValue.type) {
            case "operation":
                const operatorId = complexValue?.operator_id ?? '';
                const args = complexValue?.args ?? [];
                return OperatorExt.displayOperation(operatorId, tagList, scopeList, ...args);
            case "tag":
                const displayTagValue = TagUtils.getViewValueFromCode(tagList, complexValue?.value);
                const scope = TagUtils.getViewValueFromCode(scopeList, complexValue?.scope);
                const refYear = complexValue?.years_ago ? `N-${complexValue.years_ago}` : '';
                return [displayTagValue, scope, refYear].filter(x => !!x).join(', ');
            case "constant":
                return _displayConstantValue(complexValue);
        }
        try {
            return JSON.stringify(complexValue);
        } catch (_e) {
            return String(complexValue);
        }
    }

    function _displayConstantValue(iConst: TConstantValue): string {
        switch (iConst.expected_type) {
            case EBaseTypes.Period:
                return _displayPeriod(<IPeriod>iConst?.value);
            case EBaseTypes.DayMonth:
                return _displayDayMonth(<IDayMonth>iConst?.value);
            case EBaseTypes.String: return iConst?.value ?? '';
            case EBaseTypes.Boolean: return String(iConst?.value ?? '');
            case EBaseTypes.Numeric: return _displayNumeric(<INumericConstant>iConst);
            case EBaseTypes.Date:
                const date = DateUtils.convertSecTimestampToDate(iConst?.value);
                return DateUtils.dateToStdString(date) ?? '';
        }
        try {
            return JSON.stringify(iConst);
        } catch (_e) {
            return String(iConst);
        }
    }

    function _displayPeriod(period: IPeriod): string {
        const value = period?.value ?? '';
        if (value === null || value === undefined) {
            return '';
        }
        let dayCountType = period.dayCountType === EDayCountType.Default ? '' : EDayCountTypeExt.getTmpTitleFromId(period?.dayCountType);
        if (dayCountType) {
            dayCountType = ` (${dayCountType})`;
        }
        let unit = EPeriodUnitExt.getTmpTitleFromId(period?.unit);
        if (unit) {
            unit = ` ${unit}`;
        }
        return `${value}${unit}${dayCountType}`
    }

    function _displayDayMonth(dayMonth: IDayMonth): string {
        const day = dayMonth?.day?.toString()?.padStart(2, '0');
        const month = dayMonth?.month?.toString()?.padStart(2, '0');
        return `${day} / ${month}`;
    }

    function _displayNumeric(numeric: INumericConstant): string {
        const value = numeric?.value ?? '';
        const unit = numeric?.unit;
        const dimension = numeric?.dimension;
        if (unit) {
            return `${value} ${unit}`;
        } else if (dimension) {
            return `${value} (${dimension})`;
        }
        return `${value}`
    }

    export function complexValueExpectedOutput(complexValue?: TComplexValue, expectedOutput?: EBaseTypes | null): EBaseTypes | null {
        if (!complexValue) {
            return null;
        }
        switch (complexValue.type) {
            case EValueType.Constant: return complexValue.expected_type ?? expectedOutput ?? null;
            case EValueType.Tag: return complexValue.expected_type ?? expectedOutput ?? null;
            case EValueType.Operation:
                const operatorExt = OperatorExt.getByIdOrId(complexValue.operator_id) as OperatorExt;
                if (!operatorExt) {
                    return expectedOutput ?? null;
                }
                const args = complexValue?.args ?? [];
                return operatorExt.computeExpectedOutput(expectedOutput ?? undefined, ...args);
        }
    }

    export function operatorValueExpectedInputs(complexValue: IOperationValue, expectedOutput?: EBaseTypes | null): (EBaseTypes | null)[] {
        const operatorExt = OperatorExt.getByIdOrId(complexValue.operator_id) as OperatorExt;
        if (!operatorExt) {
            return [];
        }
        const args = complexValue?.args ?? [];
        return operatorExt.computeExpectedInputs(expectedOutput ?? undefined, ...args);
    }

    export function operatorValuePossibleNextInputs(complexValue: IOperationValue, expectedOutput?: EBaseTypes | null): (EBaseTypes | null)[] {
        const operatorExt = OperatorExt.getByIdOrId(complexValue.operator_id) as OperatorExt;
        if (!operatorExt) {
            return [];
        }
        const args = complexValue?.args ?? [];
        return operatorExt.computePossibleNextInputs(expectedOutput ?? undefined, ...args);
    }

    export const ZBaseTypes = z.nativeEnum(EBaseTypes);

    export const ZBaseValue = z.object({
        type: z.string(),
    });

    export const ZStringConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("string"),
        value: z.string(),
    });
    export const ZNumericConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("numeric"),
        value: z.number(),
        unit: z.string().optional().nullable(),
        dimension: z.string().optional().nullable(),
    });
    export const ZDateConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("date"),
        value: z.number()
    });
    export const ZBooleanConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("boolean"),
        value: z.boolean(),
    });
    export const ZPeriodConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("period"),
        value: PeriodUtils.ZPeriod,
    });
    export const ZDayMonthConstant = z.object({
        type: z.literal("constant"),
        expected_type: z.literal("day_month"),
        value: SubdateUtils.ZDayMonth,
    });

    export const ZConstantValue = z.union([
        ZStringConstant,
        ZNumericConstant,
        ZBooleanConstant,
        ZPeriodConstant,
        ZDayMonthConstant,
        ZDateConstant
    ]);

    export const ZTagValue = ZBaseValue.extend({
        type: z.literal("tag"),
        scope: z.string().optional().nullable(),
        aggregate_by: z.string().optional().nullable(),
        expected_type: ZBaseTypes,
        value: z.string(),
    });

    export const ZOperationValue: z.ZodType<unknown> = ZBaseValue.extend({
        type: z.literal("operation"),
        operator_id: z.string(),
        args: z.lazy(() => ZComplexValue.array()),
    });

    export const ZComplexValue: z.ZodType<unknown> = z.lazy(() =>
        z.union([ZOperationValue, ZTagValue, ZConstantValue])
    );
}
