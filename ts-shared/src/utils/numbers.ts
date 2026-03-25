export namespace NumberUtils {
    export function isFiniteNumber(x: unknown): x is number {
        return typeof x === 'number' && isFinite(x);
    }

    export function isNotFiniteNumber(x: unknown): boolean {
        return typeof x !== 'number' || !isFinite(x);
    }

    export function toFixedNumber(x: number, precision?: number) {
        if (precision === undefined) {
            return x;
        }
        return Number(x.toFixed(precision));
    }
}
