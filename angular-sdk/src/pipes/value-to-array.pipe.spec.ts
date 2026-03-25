import { ValueToArrayPipe } from './value-to-array.pipe';

describe('ValueToArrayPipe', () => {
    let pipe: ValueToArrayPipe;

    beforeEach(() => {
        pipe = new ValueToArrayPipe();
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('should wrap a value in an array', () => {
        expect(pipe.transform('test')).toEqual(['test']);
    });

    it('should wrap a number in an array', () => {
        expect(pipe.transform(42)).toEqual([42]);
    });

    it('should wrap null in an array', () => {
        expect(pipe.transform(null)).toEqual([null]);
    });
});
