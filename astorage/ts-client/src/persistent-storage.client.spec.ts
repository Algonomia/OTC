import axios from 'axios';
import { PersistentStorageClient } from './persistent-storage.client';
import { PersistentStorageMicroserviceError, PersistentStorageNetworkError } from './errors';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

const SERVICE_URL = 'http://localhost:3001';

function createClient(logger?: any) {
    return new PersistentStorageClient(SERVICE_URL, logger);
}

describe('PersistentStorageClient', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('constructor', () => {
        it('should build correct endpoint URLs from the service URL', () => {
            const client = createClient();
            expect(client._serviceUrl).toBe(SERVICE_URL);
        });
    });

    describe('ping', () => {
        it('should return response data on success', async () => {
            mockedAxios.get.mockResolvedValue({ data: 'pong' });
            const client = createClient();
            const result = await client.ping();
            expect(result).toBe('pong');
            expect(mockedAxios.get).toHaveBeenCalledWith(`${SERVICE_URL}/ping`);
        });

        it('should throw a generic error when the service is unreachable', async () => {
            mockedAxios.get.mockRejectedValue(new Error('ECONNREFUSED'));
            const client = createClient();
            await expect(client.ping()).rejects.toThrow('File service is not reachable');
        });
    });

    describe('getFileMetadata', () => {
        it('should POST uuids and return metadata array', async () => {
            const meta = [{ uuid: 'a', name: 'file.txt' }];
            mockedAxios.post.mockResolvedValue({ data: meta });

            const client = createClient();
            const result = await client.getFileMetadata(['a']);

            expect(mockedAxios.post).toHaveBeenCalledWith(`${SERVICE_URL}/metadata`, { ids: ['a'] });
            expect(result).toEqual(meta);
        });

        it('should return empty array on error and log via logger', async () => {
            const logger = { error: jest.fn() };
            mockedAxios.post.mockRejectedValue(new Error('fail'));

            const client = createClient(logger);
            const result = await client.getFileMetadata(['a']);

            expect(result).toEqual([]);
            expect(logger.error).toHaveBeenCalled();
        });

        it('should return empty array on error without logger', async () => {
            mockedAxios.post.mockRejectedValue(new Error('fail'));
            const client = createClient();
            const result = await client.getFileMetadata(['a']);
            expect(result).toEqual([]);
        });
    });

    describe('uploadFiles', () => {
        it('should return empty array when no files provided', async () => {
            const client = createClient();
            const result = await client.uploadFiles([]);
            expect(result).toEqual([]);
            expect(mockedAxios.post).not.toHaveBeenCalled();
        });

        it('should return empty array when files is null-ish', async () => {
            const client = createClient();
            const result = await client.uploadFiles(null as any);
            expect(result).toEqual([]);
        });

        it('should upload files via multipart form data', async () => {
            const meta = [{ uuid: 'b', name: 'test.pdf' }];
            mockedAxios.post.mockResolvedValue({ data: meta });

            const client = createClient();
            const file = { buffer: Buffer.from('content'), originalname: 'test.pdf', mimetype: 'application/pdf' };
            const result = await client.uploadFiles([file], ['extra']);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${SERVICE_URL}/upload`,
                expect.anything(),
                expect.objectContaining({ headers: expect.any(Object) }),
            );
            expect(result).toEqual(meta);
        });

        it('should throw PersistentStorageMicroserviceError on server error response', async () => {
            const axiosError = new Error('fail') as any;
            axiosError.response = { status: 500, data: { message: 'Internal' } };
            axiosError.isAxiosError = true;
            mockedAxios.post.mockRejectedValue(axiosError);
            (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

            const client = createClient();
            const file = { buffer: Buffer.from('x'), originalname: 'a.txt', mimetype: 'text/plain' };

            await expect(client.uploadFiles([file])).rejects.toThrow(PersistentStorageMicroserviceError);
        });

        it('should throw PersistentStorageNetworkError on network error', async () => {
            const axiosError = new Error('fail') as any;
            axiosError.isAxiosError = true;
            mockedAxios.post.mockRejectedValue(axiosError);
            (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);

            const client = createClient();
            const file = { buffer: Buffer.from('x'), originalname: 'a.txt', mimetype: 'text/plain' };

            await expect(client.uploadFiles([file])).rejects.toThrow(PersistentStorageNetworkError);
        });
    });

    describe('uploadFileContent', () => {
        it('should upload single file content via form data', async () => {
            const meta = [{ uuid: 'c', name: 'doc.txt' }];
            mockedAxios.post.mockResolvedValue({ data: meta });

            const client = createClient();
            const result = await client.uploadFileContent(Buffer.from('hello'), 'doc.txt', 'text/plain', 'extra');

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${SERVICE_URL}/upload`,
                expect.anything(),
                expect.objectContaining({ headers: expect.any(Object) }),
            );
            expect(result).toEqual(meta);
        });
    });

    describe('getPresignedUrls', () => {
        it('should POST uuids and return urls', async () => {
            const response = { urls: ['http://host/download?uuid=a'] };
            mockedAxios.post.mockResolvedValue({ data: response });

            const client = createClient();
            const result = await client.getPresignedUrls(['a']);

            expect(mockedAxios.post).toHaveBeenCalledWith(`${SERVICE_URL}/presign`, { uuids: ['a'] });
            expect(result).toEqual(response);
        });

        it('should throw PersistentStorageMicroserviceError on server error', async () => {
            const axiosError = new Error('fail') as any;
            axiosError.response = { status: 400, data: { error: 'bad' } };
            mockedAxios.post.mockRejectedValue(axiosError);
            (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

            const logger = { error: jest.fn() };
            const client = createClient(logger);

            await expect(client.getPresignedUrls(['a'])).rejects.toThrow(PersistentStorageMicroserviceError);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('downloadFile', () => {
        it('should GET with uuid param and return stream result', async () => {
            const mockStream = { pipe: jest.fn() };
            mockedAxios.get.mockResolvedValue({ data: mockStream, headers: { 'content-type': 'image/png' } });

            const client = createClient();
            const result = await client.downloadFile('uuid-1');

            expect(mockedAxios.get).toHaveBeenCalledWith(`${SERVICE_URL}/download`, {
                params: { uuid: 'uuid-1' },
                responseType: 'stream',
            });
            expect(result.data).toBe(mockStream);
            expect(result.headers).toEqual({ 'content-type': 'image/png' });
        });

        it('should throw on network error', async () => {
            mockedAxios.get.mockRejectedValue(new Error('timeout'));
            (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);

            const logger = { error: jest.fn() };
            const client = createClient(logger);

            await expect(client.downloadFile('uuid-1')).rejects.toThrow(PersistentStorageNetworkError);
        });
    });

    describe('downloadZipFile', () => {
        it('should POST uuids and return stream result', async () => {
            const mockStream = { pipe: jest.fn() };
            mockedAxios.post.mockResolvedValue({ data: mockStream, headers: { 'content-type': 'application/zip' } });

            const client = createClient();
            const result = await client.downloadZipFile(['a', 'b']);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${SERVICE_URL}/download`,
                { uuids: ['a', 'b'] },
                { responseType: 'stream' },
            );
            expect(result.data).toBe(mockStream);
        });

        it('should throw on server error', async () => {
            const axiosError = new Error('fail') as any;
            axiosError.response = { status: 404, data: { message: 'not found' } };
            mockedAxios.post.mockRejectedValue(axiosError);
            (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);

            const logger = { error: jest.fn() };
            const client = createClient(logger);

            await expect(client.downloadZipFile(['x'])).rejects.toThrow(PersistentStorageMicroserviceError);
        });
    });
});
