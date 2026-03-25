import { Request, Response } from 'express';

const mockStreamWrite = jest.fn();
const mockStreamDelete = jest.fn();
const mockCreateMetadata = jest.fn();
const mockUpdateMalwareScan = jest.fn();
const mockScanFile = jest.fn();

jest.mock('uuid', () => ({
    v7: jest.fn().mockReturnValue('generated-uuid'),
}));

jest.mock('../composites/streams/stream.namespace', () => ({
    Stream: {
        write: (...args: any[]) => mockStreamWrite(...args),
        deleteFile: (...args: any[]) => mockStreamDelete(...args),
    },
}));

jest.mock('../composites/metadata/create', () => ({
    createMetadata: (...args: any[]) => mockCreateMetadata(...args),
}));

jest.mock('../composites/metadata/update', () => ({
    updateMalwareScan: (...args: any[]) => mockUpdateMalwareScan(...args),
}));

jest.mock('../composites/malware/scan', () => ({
    scanFile: (...args: any[]) => mockScanFile(...args),
}));

jest.mock('../composites/common/sizes', () => ({
    LARGE_FILE_THRESHOLD: 100 * 1024 * 1024,
}));

jest.mock('../composites/common/malware_scan_status', () => ({
    MALWARE_SCAN_STATUS: {
        PENDING: 'PENDING',
        SCANNING: 'SCANNING',
        CLEAN: 'CLEAN',
        INFECTED: 'INFECTED',
        ERROR: 'ERROR',
    },
}));

import { uploadFiles } from './upload.controller';

function mockRes(): Response {
    return {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

describe('uploadFiles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStreamWrite.mockResolvedValue(undefined);
    });

    it('should return 400 if additionalData is not an array', async () => {
        const req = {
            files: [{ originalname: 'test.txt', mimetype: 'text/plain', size: 100, buffer: Buffer.from('x') }],
            body: { additionalData: JSON.stringify('not-an-array') },
        } as unknown as Request;
        const res = mockRes();

        await uploadFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'additionalData must be an array' });
    });

    it('should return 400 if no files uploaded', async () => {
        const req = {
            files: undefined,
            body: { additionalData: JSON.stringify([]) },
        } as unknown as Request;
        const res = mockRes();

        await uploadFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'No files uploaded' });
    });

    it('should return 400 if files is not an array', async () => {
        const req = {
            files: 'bad',
            body: { additionalData: JSON.stringify([]) },
        } as unknown as Request;
        const res = mockRes();

        await uploadFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'No files uploaded' });
    });

    it('should process small file with synchronous malware scan', async () => {
        const file = { originalname: 'doc.txt', mimetype: 'text/plain', size: 1024, buffer: Buffer.from('content') };
        mockScanFile.mockResolvedValue('CLEAN');
        mockCreateMetadata.mockReturnValue({ uuid: 'generated-uuid', name: 'doc.txt', malware_scan: 'CLEAN' });

        const req = {
            files: [file],
            body: {},
        } as unknown as Request;
        const res = mockRes();

        await uploadFiles(req, res);

        expect(mockStreamWrite).toHaveBeenCalledWith('generated-uuid', file.buffer);
        expect(mockScanFile).toHaveBeenCalledWith('generated-uuid');
        expect(mockCreateMetadata).toHaveBeenCalledWith('generated-uuid', file, undefined, 'CLEAN');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should process large file with async malware scan', async () => {
        const largeSize = 200 * 1024 * 1024;
        const file = { originalname: 'big.zip', mimetype: 'application/zip', size: largeSize, buffer: Buffer.alloc(0) };
        mockScanFile.mockResolvedValue('CLEAN');
        mockCreateMetadata.mockReturnValue({ uuid: 'generated-uuid', name: 'big.zip', malware_scan: 'PENDING' });

        const req = {
            files: [file],
            body: { additionalData: JSON.stringify(['tag']) },
        } as unknown as Request;
        const res = mockRes();

        await uploadFiles(req, res);

        expect(mockCreateMetadata).toHaveBeenCalledWith('generated-uuid', file, 'tag', 'PENDING');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 on unexpected error', async () => {
        const req = {
            files: null,
            body: { additionalData: '{invalid-json' },
        } as unknown as Request;
        const res = mockRes();

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        await uploadFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        errorSpy.mockRestore();
    });

    it('should return error object when individual file upload fails', async () => {
        const file = { originalname: 'fail.txt', mimetype: 'text/plain', size: 100, buffer: Buffer.from('x') };
        mockStreamWrite.mockRejectedValue(new Error('disk full'));

        const req = {
            files: [file],
            body: { additionalData: JSON.stringify([]) },
        } as unknown as Request;
        const res = mockRes();

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        await uploadFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData[0]).toEqual({ error: expect.stringContaining('Failed to upload file fail.txt') });
        errorSpy.mockRestore();
    });
});
