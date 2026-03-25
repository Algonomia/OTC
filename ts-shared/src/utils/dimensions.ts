import {CurrenciesUtil} from './currencies';

export interface IUnit {
    code: string;
    symbol?: string;
    name?: string;
}

export interface IMultiplier {
    code: string;
    multiplier: number;
    name?: string;
}

export interface IDimension {
    name: string;
    code: string;
    unit_list: IUnit[];
    multiplier_list: IMultiplier[];
}

export namespace DimensionsUtil {
    const SUPPORTED_DIMENSIONS: IDimension[] = [
        {name: 'No dimension', code: 'None', unit_list: [], multiplier_list: []},
        {name: 'Rate', code: 'rate', unit_list: [], multiplier_list: [{code: '%', multiplier: 100}]},
        {
            name: 'Financial Value',
            code: 'currency',
            unit_list: CurrenciesUtil.getAllCurrencies(),
            multiplier_list: [
                {code: 'k', multiplier: 0.001},
                {code: 'M', multiplier: 0.000001},
                {code: 'B', multiplier: 0.000000001}
            ]
        }
    ];

    export function getAllDimensions() {
        return [...SUPPORTED_DIMENSIONS];
    }
}
