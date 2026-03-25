const mockAll = jest.fn();
const mockAllSome = jest.fn();

jest.mock('../common/database', () => ({
    __esModule: true,
    default: {
        prepare: jest.fn().mockImplementation((query: string) => {
            if (query.includes('json_each')) return { all: mockAllSome };
            return { all: mockAll };
        }),
    },
}));

import { getAllMetadata, getMetadata } from './getters';

describe('getAllMetadata', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return all metadata from the database', () => {
        const data = [{ uuid: '1', name: 'a.txt' }, { uuid: '2', name: 'b.txt' }];
        mockAll.mockReturnValue(data);

        const result = getAllMetadata();
        expect(result).toEqual(data);
        expect(mockAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no records exist', () => {
        mockAll.mockReturnValue([]);
        expect(getAllMetadata()).toEqual([]);
    });
});

describe('getMetadata', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return empty array when uuids is falsy', () => {
        expect(getMetadata(null as any)).toEqual([]);
        expect(getMetadata(undefined as any)).toEqual([]);
        expect(getMetadata('' as any)).toEqual([]);
        expect(mockAllSome).not.toHaveBeenCalled();
    });

    it('should return empty array when uuids is an empty array', () => {
        expect(getMetadata([])).toEqual([]);
        expect(mockAllSome).not.toHaveBeenCalled();
    });

    it('should query by single uuid string', () => {
        const data = [{ uuid: 'abc', name: 'file.txt' }];
        mockAllSome.mockReturnValue(data);

        const result = getMetadata('abc');
        expect(mockAllSome).toHaveBeenCalledWith(JSON.stringify(['abc']));
        expect(result).toEqual(data);
    });

    it('should query by array of uuids', () => {
        const data = [{ uuid: 'a' }, { uuid: 'b' }];
        mockAllSome.mockReturnValue(data);

        const result = getMetadata(['a', 'b']);
        expect(mockAllSome).toHaveBeenCalledWith(JSON.stringify(['a', 'b']));
        expect(result).toEqual(data);
    });
});
