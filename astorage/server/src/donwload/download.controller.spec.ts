import { Request, Response } from 'express';

const mockGetReadStream = jest.fn();
const mockGetMetadata = jest.fn();
const mockUpdateError = jest.fn();
const mockCreateZip = jest.fn();
const mockGetPath = jest.fn();

jest.mock('../composites/streams/read', () => ({
    getReadStream: (...args: any[]) => mockGetReadStream(...args),
}));

jest.mock('../composites/metadata/getters', () => ({
    getMetadata: (...args: any[]) => mockGetMetadata(...args),
}));

jest.mock('../composites/metadata/update', () => ({
    updateError: (...args: any[]) => mockUpdateError(...args),
}));

jest.mock('../composites/common/zip', () => ({
    createZip: (...args: any[]) => mockCreateZip(...args),
}));

jest.mock('../composites/common/paths', () => ({
    getPath: (...args: any[]) => mockGetPath(...args),
}));

import { downloadFile, downloadZippedFiles, generateFilesUrls } from './download.controller';

function mockRes(): Response {
    return {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
    } as unknown as Response;
}

describe('downloadFile', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return 400 if uuid query param is missing', async () => {
        const req = { query: {} } as Request<{}, {}, {}, { uuid: string }>;
        const res = mockRes();

        await downloadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'UUID parameter is required' });
    });

    it('should pipe read stream on success', async () => {
        const metadata = { uuid: 'u1', name: 'file.txt', mimetype: 'text/plain' };
        mockGetMetadata.mockReturnValue([metadata]);

        const stream = { pipe: jest.fn() };
        mockGetReadStream.mockReturnValue(stream);

        const req = { query: { uuid: 'u1' } } as any;
        const res = mockRes();

        await downloadFile(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="file.txt"');
        expect(stream.pipe).toHaveBeenCalledWith(res);
    });

    it('should return 500 and update error when metadata not found', async () => {
        mockGetMetadata.mockReturnValue([]);
        mockUpdateError.mockReturnValue({ uuid: 'u2', error: 'Failed to read file' });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const req = { query: { uuid: 'u2' } } as any;
        const res = mockRes();

        await downloadFile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(mockUpdateError).toHaveBeenCalledWith('u2', 'Failed to read file');
        errorSpy.mockRestore();
    });
});

describe('downloadZippedFiles', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return 400 if uuids is not a non-empty array', async () => {
        const res = mockRes();

        await downloadZippedFiles({ body: { uuids: [] } } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);

        await downloadZippedFiles({ body: { uuids: 'bad' } } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);

        await downloadZippedFiles({ body: {} } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if no metadata found for any uuid', async () => {
        mockGetMetadata.mockReturnValue([]);

        const req = { body: { uuids: ['x'] } } as unknown as Request;
        const res = mockRes();

        await downloadZippedFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No files found for the provided uuids' });
    });

    it('should pipe zip archive on success', async () => {
        const metadata = [{ uuid: 'a', name: 'a.txt' }];
        mockGetMetadata.mockReturnValue(metadata);
        mockGetPath.mockReturnValue('/data/media/a');

        const zipStream = { pipe: jest.fn(), finalize: jest.fn() };
        mockCreateZip.mockResolvedValue(zipStream);

        const req = { body: { uuids: ['a'] } } as unknown as Request;
        const res = mockRes();

        await downloadZippedFiles(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="files.zip"');
        expect(zipStream.pipe).toHaveBeenCalledWith(res);
        expect(zipStream.finalize).toHaveBeenCalled();
    });

    it('should return 500 when zip creation fails', async () => {
        const metadata = [{ uuid: 'b', name: 'b.txt' }];
        mockGetMetadata.mockReturnValue(metadata);
        mockGetPath.mockReturnValue('/data/media/b');
        mockCreateZip.mockRejectedValue(new Error('zip error'));

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const req = { body: { uuids: ['b'] } } as unknown as Request;
        const res = mockRes();

        await downloadZippedFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        errorSpy.mockRestore();
    });
});

describe('generateFilesUrls', () => {
    it('should return 400 if uuids is not a non-empty array', () => {
        const res = mockRes();

        generateFilesUrls({ body: { uuids: [] } } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);

        generateFilesUrls({ body: {} } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should generate presigned URLs for each uuid', () => {
        process.env.HOST = 'files.example.com';
        const req = {
            body: { uuids: ['a', 'b'] },
            protocol: 'https',
        } as unknown as Request;
        const res = mockRes();

        generateFilesUrls(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            urls: [
                'https://files.example.com/download?uuid=a',
                'https://files.example.com/download?uuid=b',
            ],
        });
    });
});
