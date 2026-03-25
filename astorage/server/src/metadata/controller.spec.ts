import { Request, Response } from 'express';

const mockGetAllMetadata = jest.fn();
const mockGetMetadata = jest.fn();

jest.mock('../composites/metadata/getters', () => ({
    getAllMetadata: (...args: any[]) => mockGetAllMetadata(...args),
    getMetadata: (...args: any[]) => mockGetMetadata(...args),
}));

import { getAllMetadataReq, getMetadataReq } from './controller';

function mockRes(): Response {
    return {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

describe('getAllMetadataReq', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return all metadata with 200 status', () => {
        const data = [{ uuid: '1', name: 'a.txt' }, { uuid: '2', name: 'b.pdf' }];
        mockGetAllMetadata.mockReturnValue(data);

        const res = mockRes();
        getAllMetadataReq({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', () => {
        mockGetAllMetadata.mockImplementation(() => { throw new Error('db error'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const res = mockRes();

        getAllMetadataReq({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        errorSpy.mockRestore();
    });
});

describe('getMetadataReq', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return metadata for provided IDs', () => {
        const data = [{ uuid: 'a', name: 'file.txt' }];
        mockGetMetadata.mockReturnValue(data);

        const req = { body: { ids: ['a'] } } as Request<{}, {}, { ids: string[] }>;
        const res = mockRes();

        getMetadataReq(req, res);

        expect(mockGetMetadata).toHaveBeenCalledWith(['a']);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', () => {
        mockGetMetadata.mockImplementation(() => { throw new Error('query error'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const req = { body: { ids: ['x'] } } as Request<{}, {}, { ids: string[] }>;
        const res = mockRes();

        getMetadataReq(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        errorSpy.mockRestore();
    });
});
