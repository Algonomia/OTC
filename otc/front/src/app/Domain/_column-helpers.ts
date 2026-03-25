import {AlgoTableColumnFilterType} from '@algonomia/angular-sdk';
import {TranslateService} from '@ngx-translate/core';
import {AppInjector} from '../injector';

export function buildSortValue<T>(
    valueGetter: (x: T) => any,
    filterType: AlgoTableColumnFilterType,
    dateFallback?: (x: T) => any
): (x: T) => any {
    return (x: T) => {
        if (filterType === 'date' && dateFallback) {
            return dateFallback(x);
        }
        const val = valueGetter(x);
        if (typeof val === 'string' && !!val) {
            return AppInjector.get(TranslateService).instant(val);
        }
        return val;
    };
}

export function buildDefaultValueGetter(
    id: string,
    filterType: AlgoTableColumnFilterType
): (x: any) => any {
    if (filterType === 'date') {
        return (x: any) => x.hasOwnProperty(id) ? x[id]?.toLocaleDateString() : undefined;
    }
    return (x: any) => x.hasOwnProperty(id) ? x[id] : undefined;
}

export function mapArrayOrFallback<T>(
    arr: T[] | undefined | null,
    mapper: (x: T) => string
): string | string[] {
    if (!arr) return '';
    if (arr.length === 0) return 'N/A';
    return arr.map(mapper);
}

export function mapArrayToTexts<T>(
    arr: T[] | undefined | null,
    mapper: (x: T) => string
): {texts: string[]} {
    if (!arr) return {texts: []};
    if (arr.length === 0) return {texts: ['N/A']};
    return {texts: arr.map(mapper)};
}
