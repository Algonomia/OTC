import { listValueRequired, restrictToList } from './common';

describe('listValueRequired', () => {
    it('should error on null', () => {
        expect(listValueRequired(null)).toEqual({ required: true });
    });

    it('should error on undefined', () => {
        expect(listValueRequired(undefined)).toEqual({ required: true });
    });

    it('should error on empty array', () => {
        expect(listValueRequired([])).toEqual({ required: true });
    });

    it('should return null for a non-empty string', () => {
        expect(listValueRequired('a')).toBeNull();
    });

    it('should return null for a non-empty array', () => {
        expect(listValueRequired(['a', 'b'])).toBeNull();
    });

    it('should return null for a number', () => {
        expect(listValueRequired(42)).toBeNull();
    });
});

describe('restrictToList', () => {
    const list = ['a', 'b', 'c'];

    it('should return null when value is in list', () => {
        expect(restrictToList(list, 'a')).toBeNull();
    });

    it('should error when single value is not in list', () => {
        expect(restrictToList(list, 'z')).toEqual({ notInList: ['z'] });
    });

    it('should return null when all array values are in list', () => {
        expect(restrictToList(list, ['a', 'b'])).toBeNull();
    });

    it('should error with only the values not in list', () => {
        expect(restrictToList(list, ['a', 'z', 'y'])).toEqual({ notInList: ['z', 'y'] });
    });

    it('should return null on null', () => {
        expect(restrictToList(list, null)).toBeNull();
    });

    it('should return null on undefined', () => {
        expect(restrictToList(list, undefined)).toBeNull();
    });

    it('should return null on empty array', () => {
        expect(restrictToList(list, [])).toBeNull();
    });

    it('should work with number lists', () => {
        expect(restrictToList([1, 2, 3], 4)).toEqual({ notInList: [4] });
        expect(restrictToList([1, 2, 3], 2)).toBeNull();
    });
});
