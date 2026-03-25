import {BaseMeta} from '../../validators.abstract';
import {NullUndefinedUtils} from '../../../utils/null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

export interface ListMeta<T = string, ID = T> extends BaseMeta {
    list: readonly T[];
    idCallback?: (x: T) => ID;
    textCallback?: (x: T) => string;
    minLength?: number;
    maxLength?: number;
    emptySelectionIsNull?: boolean;
    translate?: boolean;
    isLang?: boolean;
    isCountryIso?: boolean;
}

export function listValueRequired<T>(value?: T | T[] | null): null | {required: boolean} {
    if (isNullOrUndefined(value) || (Array.isArray(value) && value.length === 0)) return {
        required: true
    };
    return null
}

export function restrictToList<T>(list: T[], value?: T | T[] | null): {notInList: T[]} | null {
    const set = new Set(list);
    if (isNullOrUndefined(value)) {
        return null;
    }
    const arr = [value].flat().filter(x => !isNullOrUndefined(x)) as T[];
    if (arr.length === 0) {
        return null;
    }
    const notInList = arr.filter(x => !set.has(x));
    if (notInList.length === 0) {
        return null;
    }
    return {notInList: notInList};
}
