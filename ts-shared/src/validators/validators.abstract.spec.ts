import { ValidatorGroup } from './validators.abstract';
import { AlgoStringValidator } from './concretes/string-validator';
import { AlgoNumberValidator } from './concretes/number-validator';

describe('ValidatorGroup', () => {
    it('should aggregate errors by field name', () => {
        const group = new ValidatorGroup<{ name: string; age: number }>({
            name: new AlgoStringValidator({ required: true, minLength: 2 }),
            age: new AlgoNumberValidator({ required: true, min: 0 }),
        });

        const errors = group.checkErrors({ name: '', age: -5 });

        const nameErrors = errors.find(([key]) => key === 'name');
        const ageErrors = errors.find(([key]) => key === 'age');

        expect(nameErrors).toBeDefined();
        expect(ageErrors).toBeDefined();
        expect(nameErrors![1]).toContainEqual({ required: true });
        expect(ageErrors![1]).toContainEqual({ min: { min: 0 } });
    });

    it('should return empty array when all fields are valid', () => {
        const group = new ValidatorGroup<{ name: string; age: number }>({
            name: new AlgoStringValidator({ required: true }),
            age: new AlgoNumberValidator({ min: 0 }),
        });

        expect(group.checkErrors({ name: 'Alice', age: 30 })).toEqual([]);
    });

    it('should handle missing values (undefined) for optional fields', () => {
        const group = new ValidatorGroup<{ name: string }>({
            name: new AlgoStringValidator({ minLength: 3 }),
        });

        expect(group.checkErrors(undefined)).toEqual([]);
    });

    describe('createFromValidatorGroup', () => {
        it('should merge multiple groups into one', () => {
            const group1 = new ValidatorGroup<{ name: string; age: number }>({
                name: new AlgoStringValidator({ required: true }),
            });
            const group2 = new ValidatorGroup<{ name: string; age: number }>({
                age: new AlgoNumberValidator({ required: true }),
            });

            const merged = ValidatorGroup.createFromValidatorGroup(group1, group2);
            const errors = merged.checkErrors({ name: '', age: null as any });

            expect(errors).toHaveLength(2);
        });
    });

    it('should expose validatorMap as a copy', () => {
        const group = new ValidatorGroup<{ x: string }>({
            x: new AlgoStringValidator({}),
        });

        const map1 = group.validatorMap;
        const map2 = group.validatorMap;
        expect(map1).not.toBe(map2);
        expect(map1).toEqual(map2);
    });
});
