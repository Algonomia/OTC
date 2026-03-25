import { IsArrayPipe } from './is-array.pipe';

describe('IsArrayPipe', () => {
    let pipe: IsArrayPipe;

    beforeEach(() => {
        pipe = new IsArrayPipe();
    });

    it('should return true for an array', () => {
        const value = [1, 2, 3];
        const result = pipe.transform(value);
        expect(result).toBe(true);
    });

    it('should return false for a non-array value', () => {
        const values = [
            {},
            'test',
            42,
            null,
            undefined,
            () => {},
            new Date()
        ];

        values.forEach(value => {
            expect(pipe.transform(value)).toBe(false);
        });
    });
});
