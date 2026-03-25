import {AEnhancedEnumFactory} from '../ts-templates/enhanced-enum-factory.abstract';
import {EBaseTypes, TComplexValue} from './complex-value.interface';
import {ComplexValueUtils} from '../utils/complex-value';
import {IScope, ITag} from './tags';

enum EOperatorGroups {
    GENERAL = 'General',
    NUMERIC = 'Numeric operations',
    TEXT_MANIPULATION = 'Text manipulation',
    DATE_MANIPULATION = 'Date manipulation',
    CONDITIONALS = 'Conditional operations',
    BINARIES = 'Binary operations',
    COMPARISONS = 'Comparisons',
    STATISTICS = 'Statistics',
    RANGES = 'Ranges'
}

export enum EOperatorId {
    Identity = "Identity",
    IF = "if",
    AND = "&&",
    OR  = "||",
    NOT = "!",
    IsTrue = "!!",
    GT  = ">",
    GTE = ">=",
    LT  = "<",
    LTE = "<=",
    EQ  = "==",
    MUL = "*",
    ADD = "+",
    SUB = "-",
    DIV = "/",
    MIN = "min",
    MAX = "max",
    MOD = "%",
    OPPOSITE = "opp",
    INVERSE = "inv",
    ABS = "abs",
    AVG = "avg",
    GEO_AVG = "geo_avg",
    SUM_ABS = "sum_abs",
    ABS_SUM = "abs_sum",
    SUM_WHEN_TRUE = "sum_when_true",
    CONCAT = "concat",
    CONCAT_WHEN_TRUE = "concat_when_true",
    NEXT_MD_AFTER = "next_md_after",
    DATE_FROM = "date_from",
    EXTRACT_DAY = "extract_day",
    EXTRACT_MONTH = "extract_month",
    EXTRACT_YEAR = "extract_year",
    EXTRACT_DAY_MONTH = "extract_day_month",
    DATE_ADD = "date_add",
    DATE_SUB = "date_sub",
    DATE_MIN = "date_min",
    DATE_MAX = "date_max",
    BOM = "bom",
    EOM = "eom",
    TO_RANGE = "to_range"
}

export class OperatorExt extends AEnhancedEnumFactory {
    private static identity = new OperatorExt(
        EOperatorId.Identity,
        EOperatorGroups.GENERAL,
        '',
        'IDENTITY',
        1,
        1,
        (expectedOutput?: EBaseTypes) => {
            if (!!expectedOutput) {
                return [expectedOutput];
            }
            return [null];
        },
        (expectedOutput?: EBaseTypes, arg?: TComplexValue) => {
            if (!!expectedOutput) {
                return expectedOutput;
            } else if (!arg) {
                return null;
            }
            return ComplexValueUtils.complexValueExpectedOutput(arg, expectedOutput);
        },
        ((arg: string) => arg)
    );

    private static if = new OperatorExt(
        EOperatorId.IF,
        EOperatorGroups.CONDITIONALS,
        '',
        'IF/ELSE',
        2,
        undefined,
        (expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => {
            const nInputs = Math.max(args.length, 2);
            const result: (EBaseTypes | null)[] = [];

            for (let i = 0; i < nInputs; ++i) {
                if (i % 2 === 0) {
                    if (i === nInputs - 1 && nInputs % 2 === 1) {
                        result.push(expectedOutput ?? null);
                    } else {
                        result.push(EBaseTypes.Boolean);
                    }
                } else {
                    result.push(expectedOutput ?? null);
                }
            }
            return result;
        },
        (expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => {
            if (!!expectedOutput) {
                return expectedOutput;
            }
            for (let i = 1; i < args.length; i = i + 2) {
                const arg = args[i];
                const type = ComplexValueUtils.complexValueExpectedOutput(arg, expectedOutput);
                if (!!type) {
                    return type;
                }
            }
            if (args.length > 2 && args.length % 2 === 1) {
                const arg = args[args.length - 1];
                const type = ComplexValueUtils.complexValueExpectedOutput(arg, expectedOutput);
                if (!!type) {
                    return type;
                }
            }
            return null;
        },
        ((...args: string[]) => {
            return args.map((arg, i) => {
                if (i % 2 === 0) {
                    if (i === args.length - 1) {
                        return `ELSE ${arg}`;
                    } else if (i !== 0) {
                        return `ELSE WHEN ${arg}`;
                    }
                    return `WHEN ${arg}`;
                }
                return `THEN ${arg}`;
            }).join(' ');
        }),
        (expectedOutput?: EBaseTypes) => {
            return [EBaseTypes.Boolean, expectedOutput ?? null];
        }
    );

    private static and = new OperatorExt(
        EOperatorId.AND,
        EOperatorGroups.BINARIES,
        '&&',
        'AND operator',
        2,
        undefined,
        EBaseTypes.Boolean,
        EBaseTypes.Boolean
    );

    private static or = new OperatorExt(
        EOperatorId.OR,
        EOperatorGroups.BINARIES,
        '||',
        'OR operator',
        2,
        undefined,
        EBaseTypes.Boolean,
        EBaseTypes.Boolean
    );

    private static not = new OperatorExt(
        EOperatorId.NOT,
        EOperatorGroups.BINARIES,
        '!',
        'NOT operator',
        1,
        1,
        EBaseTypes.Boolean,
        EBaseTypes.Boolean
    );

    private static isTrue = new OperatorExt(
        EOperatorId.IsTrue,
        EOperatorGroups.BINARIES,
        '!!',
        'Is True operator',
        1,
        1,
        EBaseTypes.Boolean,
        EBaseTypes.Boolean
    );

    private static gt = new OperatorExt(
        EOperatorId.GT,
        EOperatorGroups.COMPARISONS,
        '>',
        'Is greater operator',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Boolean
    );

    private static gte = new OperatorExt(
        EOperatorId.GTE,
        EOperatorGroups.COMPARISONS,
        '>=',
        'Is greater or equal operator',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Boolean
    );

    private static lt = new OperatorExt(
        EOperatorId.LT,
        EOperatorGroups.COMPARISONS,
        '<',
        'Is lower operator',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Boolean
    );

    private static lte = new OperatorExt(
        EOperatorId.LTE,
        EOperatorGroups.COMPARISONS,
        '<=',
        'Is lower or equal operator',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Boolean
    );

    private static eq = new OperatorExt(
        EOperatorId.EQ,
        EOperatorGroups.COMPARISONS,
        '=',
        'Is equal operator',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Boolean
    );

    private static mul = new OperatorExt(
        EOperatorId.MUL,
        EOperatorGroups.NUMERIC,
        'x',
        'Multiply',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static add = new OperatorExt(
        EOperatorId.ADD,
        EOperatorGroups.NUMERIC,
        '+',
        'Sum',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static sub = new OperatorExt(
        EOperatorId.SUB,
        EOperatorGroups.NUMERIC,
        '-',
        'Subtract',
        2,
        2,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static div = new OperatorExt(
        EOperatorId.DIV,
        EOperatorGroups.NUMERIC,
        '÷',
        'Divide',
        2,
        2,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static min = new OperatorExt(
        EOperatorId.MIN,
        EOperatorGroups.NUMERIC,
        '',
        'Minimum of',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((...args: string[]) => {
            return `Smallest of: ${args.join(', ')}`;
        })
    );

    private static max = new OperatorExt(
        EOperatorId.MAX,
        EOperatorGroups.NUMERIC,
        '',
        'Maximum of',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((...args: string[]) => {
            return `Greatest of: ${args.join(', ')}`;
        })
    );

    private static mod = new OperatorExt(
        EOperatorId.MOD,
        EOperatorGroups.NUMERIC,
        '%',
        'Modulo',
        2,
        2,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static opposite = new OperatorExt(
        EOperatorId.OPPOSITE,
        EOperatorGroups.NUMERIC,
        '-',
        'Opposite',
        1,
        1,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((arg: string) => {
            return `-${arg}`;
        })
    );

    private static inverse = new OperatorExt(
        EOperatorId.INVERSE,
        EOperatorGroups.NUMERIC,
        '1/',
        'Inverse',
        1,
        1,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((arg: string) => {
            return `1/${arg}`;
        })
    );

    private static abs = new OperatorExt(
        EOperatorId.ABS,
        EOperatorGroups.NUMERIC,
        '|.|',
        'Absolute value of',
        1,
        1,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((arg: string) => `|${arg}|`)
    );

    private static absSum = new OperatorExt(
        EOperatorId.ABS_SUM,
        EOperatorGroups.NUMERIC,
        '',
        'Absolute value of sum',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((...args: string[]) => {
            const sum = args.join('+');
            return `|${sum}|`;
        })
    );

    private static sumWhenTrue = new OperatorExt(
        EOperatorId.SUM_WHEN_TRUE,
        EOperatorGroups.NUMERIC,
        '',
        'Sum when statement true',
        2,
        undefined,
        (_expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => {
            let nInputs = Math.max(args.length, 2);
            if (nInputs % 2 === 1) {
                ++nInputs;
            }
            const result: (EBaseTypes | null)[] = [];
            for (let i = 0; i < nInputs; i++) {
                result.push(i % 2 === 0 ? EBaseTypes.Boolean : EBaseTypes.Numeric);
            }
            return result;
        },
        EBaseTypes.Numeric,
        ((...args: string[]) => {
            return args.map((arg, i) => {
                if (i % 2 === 0) {
                    return `IF ${arg}`;
                }
                return `ADD ${arg}`;
            }).join(' ');
        })
    );

    private static sumAbs = new OperatorExt(
        EOperatorId.SUM_ABS,
        EOperatorGroups.NUMERIC,
        '',
        'Sum absolute values',
        2,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric,
        ((...args: string[]) => {
            const abss = args.map(arg => `|${arg}|`);
            return abss.join(' + ')
        })
    );

    private static avg = new OperatorExt(
        EOperatorId.AVG,
        EOperatorGroups.STATISTICS,
        '',
        'Average',
        1,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static geoAvg = new OperatorExt(
        EOperatorId.GEO_AVG,
        EOperatorGroups.STATISTICS,
        '',
        'Geometrical average',
        1,
        undefined,
        EBaseTypes.Numeric,
        EBaseTypes.Numeric
    );

    private static concat = new OperatorExt(
        EOperatorId.CONCAT,
        EOperatorGroups.TEXT_MANIPULATION,
        '',
        'Concat',
        2,
        undefined,
        EBaseTypes.String,
        EBaseTypes.String,
        ((...args: string[]) => args.join(', '))
    );

    private static concatWhenTrue = new OperatorExt(
        EOperatorId.CONCAT_WHEN_TRUE,
        EOperatorGroups.TEXT_MANIPULATION,
        '',
        'Concat when statement true',
        2,
        undefined,
        (_expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => {
            let nInputs = Math.max(args.length, 2);
            if (nInputs % 2 === 1) {
                ++nInputs;
            }
            const result: (EBaseTypes | null)[] = [];
            for (let i = 0; i < nInputs; i++) {
                result.push(i % 2 === 0 ? EBaseTypes.Boolean : EBaseTypes.String);
            }
            return result;
        },
        EBaseTypes.String,
        ((...args: string[]) => {
            return args.map((arg, i) => {
                if (i % 2 === 0) {
                    return `IF ${arg}`;
                }
                return `JOIN ${arg}`;
            }).join(' ');
        })
    );

    private static nextMdAfter = new OperatorExt(
        EOperatorId.NEXT_MD_AFTER,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Next dd/mm after date',
        2,
        2,
        [EBaseTypes.Date, EBaseTypes.DayMonth],
        EBaseTypes.Date,
        ((date: string, dayMonth: string) => {
            return `${dayMonth} following ${date}`;
        })
    );

    private static dateMin = new OperatorExt(
        EOperatorId.DATE_MIN,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Earliest date between',
        2,
        undefined,
        EBaseTypes.Date,
        EBaseTypes.Date,
        ((...args: string[]) => {
            return `Earliest of: ${args.join(', ')}`;
        })
    );

    private static dateMax = new OperatorExt(
        EOperatorId.DATE_MAX,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Latest date between',
        2,
        undefined,
        EBaseTypes.Date,
        EBaseTypes.Date,
        ((...args: string[]) => {
            return `Latest of: ${args.join(', ')}`;
        })
    );

    private static dateFrom = new OperatorExt(
        EOperatorId.DATE_FROM,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Date from (dd/mm/yyyy)',
        3,
        3,
        [EBaseTypes.Numeric, EBaseTypes.Numeric, EBaseTypes.Numeric],
        EBaseTypes.Date,
        ((dd: string, mm: string, yyyy: string) => {
            return `${dd}/${mm}/${yyyy}`;
        })
    );

    private static extractDay = new OperatorExt(
        EOperatorId.EXTRACT_DAY,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Extract day',
        1,
        1,
        ((expectedOutput?: EBaseTypes, dayMonthOrDate?: TComplexValue) => [ComplexValueUtils.complexValueExpectedOutput(dayMonthOrDate, expectedOutput)]),
        EBaseTypes.Numeric,
        ((x: string) => {
            return `DD from ${x}`;
        }),
        [EBaseTypes.Date, EBaseTypes.DayMonth]
    );

    private static extractMonth = new OperatorExt(
        EOperatorId.EXTRACT_MONTH,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Extract month',
        1,
        1,
        ((expectedOutput?: EBaseTypes, dayMonthOrDate?: TComplexValue) => [ComplexValueUtils.complexValueExpectedOutput(dayMonthOrDate, expectedOutput)]),
        EBaseTypes.Numeric,
        ((x: string) => {
            return `MM from ${x}`;
        }),
        [EBaseTypes.Date, EBaseTypes.DayMonth]
    );

    private static extractYear = new OperatorExt(
        EOperatorId.EXTRACT_YEAR,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Extract year',
        1,
        1,
        EBaseTypes.Date,
        EBaseTypes.Numeric,
        ((x: string) => {
            return `YYYY from ${x}`;
        })
    );

    private static extractDayMonth = new OperatorExt(
        EOperatorId.EXTRACT_DAY_MONTH,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Extract Day and Month',
        1,
        1,
        EBaseTypes.Date,
        EBaseTypes.DayMonth,
        ((x: string) => {
            return `DD/MM from ${x}`;
        })
    );

    private static dateAdd = new OperatorExt(
        EOperatorId.DATE_ADD,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Add period to date',
        2,
        2,
        [EBaseTypes.Date, EBaseTypes.Period],
        EBaseTypes.Date,
        ((date: string, period: string) => {
            return `${period} after ${date}`;
        })
    );

    private static dateSub = new OperatorExt(
        EOperatorId.DATE_SUB,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Subtract period from date',
        2,
        2,
        [EBaseTypes.Date, EBaseTypes.Period],
        EBaseTypes.Date,
        ((date: string, period: string) => {
            return `${period} before ${date}`;
        })
    );

    private static bom = new OperatorExt(
        EOperatorId.BOM,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'Beginning of month',
        1,
        1,
        EBaseTypes.Date,
        EBaseTypes.Date,
        ((arg: string) => {
            return `Start month of ${arg}`;
        })
    );

    private static eom = new OperatorExt(
        EOperatorId.EOM,
        EOperatorGroups.DATE_MANIPULATION,
        '',
        'End of month',
        1,
        1,
        EBaseTypes.Date,
        EBaseTypes.Date,
        ((arg: string) => {
            return `End month of ${arg}`;
        })
    );

    private static toRange = new OperatorExt(
        EOperatorId.TO_RANGE,
        EOperatorGroups.RANGES,
        '',
        'Create range from',
        1,
        undefined,
        (expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => {
            const nInputs = Math.max(1, args.length ?? 0);
            return Array(nInputs).fill(expectedOutput ?? args[1] ?? null);
        },
        (expectedOutput?: EBaseTypes, arg?: TComplexValue) => {
            if (!!expectedOutput) {
                return expectedOutput;
            } else if (!arg) {
                return null;
            }
            return ComplexValueUtils.complexValueExpectedOutput(arg, expectedOutput);
        },
        ((arg1: string, arg2: string) => {
            return `Between ${arg1} and ${arg2}`;
        }),
        ((expectedOutput?: EBaseTypes | null) => {
            return expectedOutput ? [expectedOutput] : [EBaseTypes.Date, EBaseTypes.Numeric, EBaseTypes.Period];
        })
    );

    static getAllNonIdentityOperators(): OperatorExt[] {
        return (OperatorExt.getAllAvailables() as OperatorExt[]).filter(x => x.id !== EOperatorId.Identity);
    }

    static displayOperation(operator: string | EOperatorId, tagList: ITag[], scopeList: IScope[], ...args: TComplexValue[]): string {
        const operatorExt = OperatorExt.getById(operator) as OperatorExt;
        if (!!operatorExt?._displayFunc) {
            return operatorExt._displayFunc(...args.map(x => ComplexValueUtils.display(x, tagList, scopeList)));
        }
        if (operatorExt?.symbol && operatorExt.minArgs > 1) {
            return this._displayWithSymbol(operatorExt.symbol, tagList, scopeList, ...args);
        }
        return this._displayDefault(operatorExt.symbol ?? operator, tagList, scopeList, ...args)
    }

    private static _displayWithSymbol(symbol: string, tagList: ITag[], scopeList: IScope[], ...args: TComplexValue[]) {
        const separator = ` ${symbol} `;
        const subDisplays = args.map(x => ComplexValueUtils.display(x, tagList, scopeList));
        return `(${subDisplays.join(separator)})`;
    }

    private static _displayDefault(operator: string | EOperatorId, tagList: ITag[], scopeList: IScope[], ...args: TComplexValue[]) {
        const funcArgs = args.map(x => ComplexValueUtils.display(x, tagList, scopeList)).join(', ');
        return `${operator}(${funcArgs})`;
    }

    static getMinMaxArgs(operatorId?: EOperatorId | string) {
        const operatorExt = OperatorExt.getById(operatorId) as OperatorExt | undefined;
        if (!operatorExt) {
            return {min_args: 0, max_args: 0};
        }
        return {min_args: operatorExt.minArgs, max_args: operatorExt.maxArgs};
    }

    static getSymbol(operatorId?: EOperatorId | string) {
        const operatorExt = OperatorExt.getById(operatorId) as OperatorExt | undefined;
        if (!operatorExt) {
            return '';
        } else if (operatorExt.symbol) {
            return operatorExt.symbol;
        }
        return '';
    }

    static getTitle(operatorId?: string | EOperatorId): string {
        const operatorExt = OperatorExt.getById(operatorId) as OperatorExt | undefined;
        if (!operatorExt) {
            return operatorId ?? '';
        }
        return operatorExt.title;
    }

    private constructor(
        public readonly operatorId: EOperatorId,
        public readonly groupTitle: EOperatorGroups,
        public readonly symbol = '',
        public readonly title = '',
        public readonly minArgs: number = 1,
        public readonly maxArgs?: number,
        public readonly expectedInputs: (EBaseTypes | null) | (EBaseTypes | null)[] | ((expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => (EBaseTypes | null)[]) = [],
        public readonly expectedOutput: (EBaseTypes | null) | ((expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => EBaseTypes | null) = EBaseTypes.Numeric,
        private _displayFunc?: (...displayArgs: string[]) => string,
        public readonly possibleNextInputs?: (EBaseTypes | null)[] | ((expectedOutput?: EBaseTypes, ...args: TComplexValue[]) => (EBaseTypes | null)[])
    ) {
        super(operatorId);
    }

    computePossibleNextInputs(expectedOutput?: EBaseTypes, ...args: TComplexValue[]): (EBaseTypes | null)[] {
        if (this.possibleNextInputs instanceof Function) {
            return this.possibleNextInputs(expectedOutput, ...args);
        } else if (!!this.possibleNextInputs) {
            return this.possibleNextInputs;
        }
        const expInputs = this.computeExpectedInputs(expectedOutput, ...args);
        const index = args.length;
        if (index < expInputs.length) {
            return [expInputs[index]];
        }
        return [null];
    }

    computeExpectedInputs(expectedOutput?: EBaseTypes, ...args: TComplexValue[]): (EBaseTypes | null)[] {
        if (this.expectedInputs instanceof Function) {
            return this.expectedInputs(expectedOutput, ...args);
        } else if (!Array.isArray(this.expectedInputs)) {
            const nInputs = Math.min(Math.max(this.minArgs, args?.length ?? 0), this.maxArgs ?? Infinity);
            return Array(nInputs).fill(this.expectedInputs);
        }
        return this.expectedInputs;
    }

    computeExpectedOutput(expectedOutput?: EBaseTypes, ...args: TComplexValue[]): EBaseTypes | null {
        if (this.expectedOutput instanceof Function) {
            return this.expectedOutput(expectedOutput, ...args);
        }
        return this.expectedOutput;
    }
}
