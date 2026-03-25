import {IPeriod} from '../utils/periods';
import {IDayMonth} from '../utils/sub-dates';

export enum EValueType {
    Tag = 'tag',
    Operation = 'operation',
    Constant = 'constant',
}

interface IBaseValue {
    type: EValueType;
}

export enum EBaseTypes {
    String = 'string',
    Date = 'date',
    Numeric = 'numeric',
    Boolean = 'boolean',
    Period = 'period',
    DayMonth = 'day_month'
}

export type TComplexValue = IOperationValue | ITagValue | TConstantValue;

export interface IOperationValue extends IBaseValue {
    type: EValueType.Operation;
    operator_id: string;
    args: TComplexValue[];
}

export interface ITagValue extends IBaseValue {
    type: EValueType.Tag;
    scope?: string | null;
    years_ago?: number | null;
    aggregate_by?: 'MAX' | 'MIN' | 'AVG' | 'SUM' | 'GeoAVG' | 'CONCAT' | 'CONCAT_UNIQUE' | 'HISTOGRAM' | null;
    is_custom?: boolean | null;
    expected_type: EBaseTypes;
    value: string;
}

export type TConstantValue = IStringConstant | INumericConstant | IBooleanConstant | IPeriodConstant | IDateConstant | IDayMonthConstant;

interface IConstant<T> {
    type: EValueType.Constant;
    expected_type: EBaseTypes;
    value: T;
}

export interface IStringConstant extends IConstant<string> {
    expected_type: EBaseTypes.String;
    value: string;
}

export interface INumericConstant extends IConstant<number> {
    expected_type: EBaseTypes.Numeric;
    value: number;
    unit?: string | null;
    dimension?: string | null;
}

export interface IBooleanConstant extends IConstant<boolean> {
    expected_type: EBaseTypes.Boolean;
    value: boolean;
}

export interface IPeriodConstant extends IConstant<IPeriod> {
    expected_type: EBaseTypes.Period;
    value: IPeriod;
}

export interface IDayMonthConstant extends IConstant<IDayMonth> {
    expected_type: EBaseTypes.DayMonth;
    value: IDayMonth;
}

export interface IDateConstant extends IConstant<number> {
    expected_type: EBaseTypes.Date;
    value: number; // timestamp in seconds
}
