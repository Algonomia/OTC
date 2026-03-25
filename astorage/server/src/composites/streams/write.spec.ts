import { EventEmitter } from 'events';

jest.mock('../common/paths', () => ({
    getPath: (uuid: string) => `/data/media/${uuid}`,
}));

jest.mock('../common/sizes', () => ({
    CHUNK_SIZE: 1024,
}));

const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();

let capturedStreamCallbacks: { onError?: Function; onFinish?: Function } = {};
const mockStream = {
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn().mockImplementation(function (this: any, event: string, cb: Function) {
        if (event === 'error') capturedStreamCallbacks.onError = cb;
        if (event === 'finish') capturedStreamCallbacks.onFinish = cb;
        return this;
    }),
};

const mockCreateWriteStream = jest.fn().mockReturnValue(mockStream);

jest.mock('fs', () => ({
    existsSync: (...args: any[]) => mockExistsSync(...args),
    mkdirSync: (...args: any[]) => mockMkdirSync(...args),
    createWriteStream: (...args: any[]) => mockCreateWriteStream(...args),
}));

import { sendToWriteStream } from './write';

describe('sendToWriteStream', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedStreamCallbacks = {};
        mockStream.on.mockImplementation(function (this: any, event: string, cb: Function) {
            if (event === 'error') capturedStreamCallbacks.onError = cb;
            if (event === 'finish') capturedStreamCallbacks.onFinish = cb;
            return this;
        });
        mockCreateWriteStream.mockReturnValue(mockStream);
    });

    it('should write content and resolve on finish', async () => {
        mockExistsSync.mockReturnValue(true);

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const promise = sendToWriteStream('uuid-1', Buffer.from('hello'));

        capturedStreamCallbacks.onFinish!();
        await promise;

        expect(mockCreateWriteStream).toHaveBeenCalledWith('/data/media/uuid-1', { highWaterMark: 1024 });
        expect(mockStream.write).toHaveBeenCalledWith(Buffer.from('hello'));
        expect(mockStream.end).toHaveBeenCalled();
        logSpy.mockRestore();
    });

    it('should create directory if it does not exist', async () => {
        mockExistsSync.mockReturnValue(false);

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const promise = sendToWriteStream('uuid-2', Buffer.from('data'));

        capturedStreamCallbacks.onFinish!();
        await promise;

        expect(mockMkdirSync).toHaveBeenCalledWith('/data/media', { recursive: true });
        logSpy.mockRestore();
    });

    it('should not create directory if it already exists', async () => {
        mockExistsSync.mockReturnValue(true);

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const promise = sendToWriteStream('uuid-3', Buffer.from('data'));

        capturedStreamCallbacks.onFinish!();
        await promise;

        expect(mockMkdirSync).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });

    it('should reject when stream emits error', async () => {
        mockExistsSync.mockReturnValue(true);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const promise = sendToWriteStream('uuid-4', Buffer.from('data'));

        capturedStreamCallbacks.onError!(new Error('disk full'));

        await expect(promise).rejects.toThrow('disk full');
        errorSpy.mockRestore();
    });

    it('should reject when createWriteStream throws synchronously', async () => {
        mockExistsSync.mockReturnValue(true);
        mockCreateWriteStream.mockImplementation(() => { throw new Error('EMFILE'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        await expect(sendToWriteStream('uuid-5', Buffer.from('data'))).rejects.toThrow('EMFILE');
        errorSpy.mockRestore();
    });
});
