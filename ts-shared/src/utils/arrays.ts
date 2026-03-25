import {GlobalVariables} from './global-variables';
import {NullUndefinedUtils} from './null-undefined';

type _TNestedArray<T> = Array<T | _TNestedArray<T>>;
type _TComparable = string | number | boolean | Date;

export namespace ArrayUtils {
    export const STANDARD_GENERAL_COMPARATOR = _standardGeneralComparator.bind(null, 1, false);
    export const STANDARD_GENERAL_COMPARATOR_REVERSE = _standardGeneralComparator.bind(null, -1, false);
    export const STANDARD_GENERAL_COMPARATOR_INTL = _standardGeneralComparator.bind(null, 1, true);
    export const STANDARD_GENERAL_COMPARATOR_INTL_REVERSE = _standardGeneralComparator.bind(null, -1, true);

    export const STANDARD_GENERAL_ARR_COMPARATOR = _standardGeneralArrComparator.bind(null, 1, false);
    export const STANDARD_GENERAL_ARR_COMPARATOR_REVERSE = _standardGeneralArrComparator.bind(null, -1, false);
    export const STANDARD_GENERAL_ARR_COMPARATOR_INTL = _standardGeneralArrComparator.bind(null, 1, true);
    export const STANDARD_GENERAL_ARR_COMPARATOR_INTL_REVERSE = _standardGeneralArrComparator.bind(null, -1, true);

    function _standardGeneralComparator(sortMultiplier = 1, shouldCompareWithIntl = false, x1: _TComparable, x2: _TComparable): number {
        let comparison = 0;
        if (shouldCompareWithIntl && (typeof x1 === 'string') && (typeof x2 === 'string')) {
            comparison = GlobalVariables.INTL_COLLATOR.compare(x1, x2);
        } else if (x1 > x2) {
            comparison = 1;
        } else if (x1 < x2) {
            comparison = -1;
        }
        return comparison * sortMultiplier;
    }

    function _normalizeArrForComparison(arr: unknown[]): unknown[] {
        if (NullUndefinedUtils.isNullOrUndefined(arr)) {
            return [];
        }
        if (!Array.isArray(arr)) {
            return [arr];
        }
        return arr;
    }

    function _standardGeneralArrComparator(sortMultiplier = 1, shouldCompareWithIntl = false, arr1: unknown[], arr2: unknown[]): number {
        const normalized1 = _normalizeArrForComparison(arr1);
        const normalized2 = _normalizeArrForComparison(arr2);
        const minIdx = Math.min(normalized1.length, normalized2.length);
        for (let sortIdx = 0; sortIdx < minIdx; ++sortIdx) {
            const compare = _standardGeneralComparator(sortMultiplier, shouldCompareWithIntl, normalized1[sortIdx] as _TComparable, normalized2[sortIdx] as _TComparable);
            if (compare !== 0) {
                return compare;
            }
        }
        return sortMultiplier * (normalized1.length - normalized2.length);
    }

    export function convertThenSortWithArrays<T>(
        arr: T[],
        convertFunc: ((x: T) => unknown | unknown[]) = (a => [a]),
        sortMultiplier = 1,
        shouldCompareWithIntl = false
    ): T[] {
        const convertedArr = arr.map(x => {
            const converted = convertFunc(x);
            return Array.isArray(converted) ? converted : [converted];
        });

        return arrRange(0, arr.length - 1)
            .sort((x1, x2) => _standardGeneralArrComparator(sortMultiplier, shouldCompareWithIntl, convertedArr[x1], convertedArr[x2]))
            .map(i => arr[i]);
    }

    export function convertThenSort<T>(arr: T[], convertFunc: (x: T, i?: number) => unknown = ((a: T) => a), sortMultiplier = 1, shouldCompareWithIntl = false): T[] {
        if (arr.length <= 1) {
            return [...arr];
        }
        const convertedArr = arr.map((x, i) => shouldCompareWithIntl ? String(convertFunc(x, i)) : convertFunc(x, i)) as _TComparable[];
        return arrRange(0, arr.length - 1)
            .sort((x1, x2) => {
                let comparison = 0;
                if (shouldCompareWithIntl) {
                    comparison = GlobalVariables.INTL_COLLATOR.compare(String(convertedArr[x1]), String(convertedArr[x2]));
                } else if (convertedArr[x1] > convertedArr[x2]) {
                    comparison = 1;
                } else if (convertedArr[x1] < convertedArr[x2]) {
                    comparison = -1;
                }
                return comparison * sortMultiplier;
            })
            .map(i => arr[i]);
    }

    export function convertThenSortFlexible<T>(array: T[], convertFunc: (x: T) => _TComparable = ((x: T) => x as unknown as _TComparable), sortMultiplier = 1): T[] {
        const convertedArr = array.map(x => convertFunc(x));
        return arrRange(0, array.length - 1)
            .sort((x1, x2) => {
                let comparison = 0;
                if (typeof convertedArr[x1] === 'string' || typeof convertedArr[x2] === 'string') {
                    comparison = GlobalVariables.INTL_COLLATOR.compare(String(convertedArr[x1]), String(convertedArr[x2]));
                } else if (convertedArr[x1] > convertedArr[x2]) {
                    comparison = 1;
                } else if (convertedArr[x1] < convertedArr[x2]) {
                    comparison = -1;
                }
                return comparison * sortMultiplier;
            })
            .map(i => array[i]);
    }

    export function arrRange(start: number, end: number, isInverse = false): number[] {
        if (end < start) {
            return [];
        }
        const newArray = Array(end - start + 1).fill(null);
        return isInverse ? newArray.map((_, idx) => end - idx) : newArray.map((_, idx) => start + idx);
    }

    export function flattenUniques<T>(items: _TNestedArray<T>): T[] {
        const flatSet = new Set<T>();
        (function recursive(recItems: _TNestedArray<T>) {
            recItems?.forEach(item => {
                if (Array.isArray(item)) {
                    recursive(item);
                } else {
                    flatSet.add(item);
                }
            });
        })(items);
        return Array.from(flatSet);
    }

    export function uniques<T>(items: T[]): T[] {
        return Array.from(new Set(items));
    }

    export function uniqueValues<T, V>(items: T[], transform: (x: T) => V): V[] {
        return Array.from(new Set(items.map(transform)));
    }

    export function findWithBinarySearch<S, T>(arr: S[], x: T, callback: (e: S, x: T) => number): S | undefined {
        const index = findIndexWithBinarySearch(arr, x, callback);
        return index !== undefined ? arr[index] : undefined;
    }

    export function includesWithBinarySearch<S, T>(arr: S[], x: T, callback: (e: S, x: T) => number): boolean {
        return findIndexWithBinarySearch(arr, x, callback) !== undefined;
    }

    export function findIndexWithBinarySearch<S, T>(arr: S[], x: T, callback: (e: S, x: T) => number): number | undefined {
        let start = 0, end = arr.length - 1;
        while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            const cmp = callback(arr[mid], x);
            if (cmp === 0) {
                return mid;
            }
            if (cmp < 0) {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }
        return undefined;
    }
}
