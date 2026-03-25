import { CallFuncOrValPipe } from './call-func-or-val.pipe';

describe('CallFuncOrValPipe', () => {
    let pipe: CallFuncOrValPipe;

    beforeEach(() => {
        pipe = new CallFuncOrValPipe();
    });

    it('should call a function without arguments and return the result', () => {
        const fn = jasmine.createSpy().and.returnValue(42);
        const result = pipe.transform(fn);
        expect(fn).toHaveBeenCalled();
        expect(result).toBe(42);
    });

    it('should call a function with arguments and return the result', () => {
        const fn = (a: number, b: number) => a + b;
        const result = pipe.transform(fn, 2, 3);
        expect(result).toBe(5);
    });

    it('should return the value if it is not a function', () => {
        const val = 'test';
        const result = pipe.transform(val);
        expect(result).toBe(val);
    });

    it('should return the function if it throws an exception', () => {
        const fn = () => { throw new Error('oops'); };
        const result = pipe.transform(fn);
        expect(result).toBe(fn);
    });
});
