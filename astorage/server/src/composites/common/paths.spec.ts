describe('paths', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should use default sqlLitePath when env is not set', () => {
        delete process.env.SQLITE_FILE_PATH;
        const { sqlLitePath } = require('./paths');
        expect(sqlLitePath).toBe('data/sqlite.db');
    });

    it('should use env SQLITE_FILE_PATH when set', () => {
        process.env.SQLITE_FILE_PATH = '/custom/path.db';
        const { sqlLitePath } = require('./paths');
        expect(sqlLitePath).toBe('/custom/path.db');
    });

    it('should use default fileStoragePath when env is not set', () => {
        delete process.env.FILE_STORAGE_PATH;
        const { fileStoragePath } = require('./paths');
        expect(fileStoragePath).toBe('data/media');
    });

    it('should use env FILE_STORAGE_PATH when set', () => {
        process.env.FILE_STORAGE_PATH = '/mnt/storage';
        const { fileStoragePath } = require('./paths');
        expect(fileStoragePath).toBe('/mnt/storage');
    });

    it('getPath should return storagePath/uuid', () => {
        delete process.env.FILE_STORAGE_PATH;
        const { getPath } = require('./paths');
        expect(getPath('abc-123')).toBe('data/media/abc-123');
    });

    it('getPath should use custom storage path', () => {
        process.env.FILE_STORAGE_PATH = '/files';
        const { getPath } = require('./paths');
        expect(getPath('uuid-1')).toBe('/files/uuid-1');
    });
});
