export namespace NullUndefinedUtils {
    export function isNullOrUndefined<T>(x: T): x is T & (null | undefined) {
        return x === null || x === undefined;
    }

    export function isNotNullOrUndefined<T>(x: T): x is NonNullable<T> {
        return x !== null && x !== undefined;
    }
}
