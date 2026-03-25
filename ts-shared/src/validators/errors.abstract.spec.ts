import { ValidatorErrors, EValidatorErrors } from './errors.abstract';

describe('ValidatorErrors', () => {
    describe('static instances', () => {
        it('has an instance for every EValidatorErrors value', () => {
            Object.values(EValidatorErrors).forEach(val => {
                const instance = ValidatorErrors.getById(val);
                expect(instance).toBeDefined();
            });
        });

        it('each instance has a text property', () => {
            const all = ValidatorErrors.getAllAvailables();
            all.forEach((entry: any) => {
                expect(typeof entry.text).toBe('string');
                expect(entry.text.length).toBeGreaterThan(0);
            });
        });
    });

    describe('getErrorFromId', () => {
        it('returns the text for a known error', () => {
            const result = ValidatorErrors.getErrorFromId(EValidatorErrors.required as any);
            expect(result).toBe('Shared.ValidatorErrors.required');
        });

        it('returns default text for an unknown id', () => {
            const result = ValidatorErrors.getErrorFromId('nonexistent' as any);
            expect(result).toBe('Shared.ValidatorErrors.default');
        });
    });

});
