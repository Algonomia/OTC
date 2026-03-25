import { IsFunctionPipe } from './is-function.pipe';

describe('IsFunctionPipe', () => {
    let pipe: IsFunctionPipe;

    beforeEach(() => {
        pipe = new IsFunctionPipe();
    });

    it('should return true for a function', () => {
        const fn = () => {};
        const result = pipe.transform(fn);

        expect(result).toBe(true);
    });

    it('should return false for a non-functional value', () => {
        const values = [
            42,
            'test',
            {},
            [],
            null,
            undefined,
            new Date()
        ];

        values.forEach(value => {
            expect(pipe.transform(value)).toBe(false);
        });
    });
});
