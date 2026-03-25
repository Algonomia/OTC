import { ZFileWithUuid, ZDownloadFilesBody } from './file.interface';

describe('file.interface Zod schemas', () => {
    describe('ZFileWithUuid', () => {
        it('accepts a valid file with uuid', () => {
            const file = { uuid: 'abc-123', name: 'report.pdf' };
            expect(ZFileWithUuid.parse(file)).toEqual(file);
        });

        it('accepts optional extension and size', () => {
            const file = { uuid: 'abc-123', name: 'report.pdf', extension: '.pdf', size: 1024 };
            expect(ZFileWithUuid.parse(file)).toEqual(file);
        });

        it('rejects missing uuid', () => {
            expect(() => ZFileWithUuid.parse({ name: 'report.pdf' })).toThrow();
        });

        it('rejects missing name', () => {
            expect(() => ZFileWithUuid.parse({ uuid: 'abc-123' })).toThrow();
        });

        it('rejects non-string uuid', () => {
            expect(() => ZFileWithUuid.parse({ uuid: 123, name: 'report.pdf' })).toThrow();
        });
    });

    describe('ZDownloadFilesBody', () => {
        it('accepts a valid uuids array', () => {
            const body = { uuids: ['uuid-1', 'uuid-2'] };
            expect(ZDownloadFilesBody.parse(body)).toEqual(body);
        });

        it('accepts an empty uuids array', () => {
            expect(ZDownloadFilesBody.parse({ uuids: [] })).toEqual({ uuids: [] });
        });

        it('rejects missing uuids', () => {
            expect(() => ZDownloadFilesBody.parse({})).toThrow();
        });

        it('rejects non-string elements in uuids', () => {
            expect(() => ZDownloadFilesBody.parse({ uuids: [123] })).toThrow();
        });
    });
});
