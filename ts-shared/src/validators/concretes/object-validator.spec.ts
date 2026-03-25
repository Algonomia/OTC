import { AlgoObjectValidator } from './object-validator';
import { AlgoStringValidator } from './string-validator';
import { AlgoNumberValidator } from './number-validator';

describe('AlgoObjectValidator', () => {
    describe('required', () => {
        const v = new AlgoObjectValidator({
            required: true,
            mapKeyValidator: new Map(),
        });

        it('should error on null', () => {
            expect(v.checkErrors(null)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should accept a valid object', () => {
            expect(v.checkErrors({})).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoObjectValidator({
            mapKeyValidator: new Map(),
        });

        it('should accept null without error', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });

        it('should accept undefined without error', () => {
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('schema validation (Zod)', () => {
        const v = new AlgoObjectValidator({
            mapKeyValidator: new Map([['name', new AlgoStringValidator({})]]),
        });

        it('should accept a valid TJsonObject', () => {
            expect(v.checkErrors({ name: 'Alice' })).toEqual([]);
        });

        it('should error on non-TJsonObject values', () => {
            const errors = v.checkErrors(42 as any);
            expect(errors).toContainEqual({ invalidObject: true });
        });
    });

    describe('unauthorized keys', () => {
        const mapKeyValidator = new Map<string, any>([
            ['name', new AlgoStringValidator({})],
            ['age', new AlgoNumberValidator({})],
        ]);
        const v = new AlgoObjectValidator({ mapKeyValidator });

        it('should error when object has unauthorized keys', () => {
            const errors = v.checkErrors({ name: 'Alice', age: 30, extra: 'bad' });
            expect(errors).toContainEqual({
                unauthorizedKeys: { unauthorizedKeys: ['extra'] },
            });
        });

        it('should accept object with only authorized keys', () => {
            expect(v.checkErrors({ name: 'Alice', age: 30 })).toEqual([]);
        });

        it('should accept object with subset of authorized keys', () => {
            expect(v.checkErrors({ name: 'Alice' })).toEqual([]);
        });
    });

    describe('missing keys', () => {
        const mapKeyValidator = new Map<string, any>([
            ['name', new AlgoStringValidator({})],
            ['age', new AlgoNumberValidator({})],
        ]);
        const v = new AlgoObjectValidator({
            mapKeyValidator,
            mandatoryKeys: ['name', 'age'],
        });

        it('should error when mandatory keys are missing', () => {
            const errors = v.checkErrors({ name: 'Alice' });
            expect(errors).toContainEqual({
                missingKeys: { missingKeys: ['age'] },
            });
        });

        it('should accept object with all mandatory keys', () => {
            expect(v.checkErrors({ name: 'Alice', age: 30 })).toEqual([]);
        });
    });

    describe('nested value validation', () => {
        const mapKeyValidator = new Map<string, any>([
            ['name', new AlgoStringValidator({ required: true })],
        ]);
        const v = new AlgoObjectValidator({ mapKeyValidator });

        it('should skip check on null', () => {
            expect(v.checkErrors(null)).toEqual([]);
        });
    });
});
