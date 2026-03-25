import {TJsonObject, TJsonValue} from '../interface/json-object.type';

export namespace ObjectUtils {
    export function isObject(x: unknown): x is Record<string, unknown> {
        return typeof x === 'object' && x !== null;
    }

    export function deepCopy<T extends TJsonValue>(value?: T): T | null {
        if (value === null || value === undefined || typeof value !== 'object') {
            return value ?? null;
        }

        if (Array.isArray(value)) {
            return value.map(item => deepCopy(item)) as T;
        }

        const copied: TJsonObject = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                copied[key] = deepCopy(value[key]);
            }
        }
        return copied as T;
    }

    export function fuseObjects<T extends Record<string, unknown>>(...objects: T[]): T {
        return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
    }
}
