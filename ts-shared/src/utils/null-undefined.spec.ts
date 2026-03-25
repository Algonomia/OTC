import {NullUndefinedUtils} from './null-undefined';

describe('NullUndefinedUtils', () => {
    describe('isNullOrUndefined', () => {
        it('returns true for null', () => {
            expect(NullUndefinedUtils.isNullOrUndefined(null)).toBe(true);
        });
        it('returns true for undefined', () => {
            expect(NullUndefinedUtils.isNullOrUndefined(undefined)).toBe(true);
        });
        it('returns false for non-null/undefined values', () => {
            expect(NullUndefinedUtils.isNullOrUndefined(0)).toBe(false);
            expect(NullUndefinedUtils.isNullOrUndefined('')).toBe(false);
            expect(NullUndefinedUtils.isNullOrUndefined(false)).toBe(false);
            expect(NullUndefinedUtils.isNullOrUndefined({})).toBe(false);
            expect(NullUndefinedUtils.isNullOrUndefined([])).toBe(false);
        });
    });
    describe('isNotNullOrUndefined', () => {
        it('returns false for null', () => {
            expect(NullUndefinedUtils.isNotNullOrUndefined(null)).toBe(false);
        });
        it('returns false for undefined', () => {
            expect(NullUndefinedUtils.isNotNullOrUndefined(undefined)).toBe(false);
        });
        it('returns true for non-null/undefined values', () => {
            expect(NullUndefinedUtils.isNotNullOrUndefined(0)).toBe(true);
            expect(NullUndefinedUtils.isNotNullOrUndefined('')).toBe(true);
            expect(NullUndefinedUtils.isNotNullOrUndefined(false)).toBe(true);
            expect(NullUndefinedUtils.isNotNullOrUndefined({})).toBe(true);
            expect(NullUndefinedUtils.isNotNullOrUndefined([])).toBe(true);
        });
    });
});
