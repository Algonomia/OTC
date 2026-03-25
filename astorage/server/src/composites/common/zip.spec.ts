import { createZip } from './zip';
import { access } from 'fs/promises';

jest.mock('fs/promises', () => ({
    access: jest.fn(),
}));

const mockedAccess = access as jest.MockedFunction<typeof access>;

describe('createZip', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return an archiver instance', async () => {
        mockedAccess.mockResolvedValue(undefined);
        const files = [{ path: '/data/media/uuid-1', name: 'file.txt' }];
        const archive = await createZip(files);

        expect(archive).toBeDefined();
        expect(typeof archive.pipe).toBe('function');
        expect(typeof archive.finalize).toBe('function');
    });

    it('should add accessible files to the archive', async () => {
        mockedAccess.mockResolvedValue(undefined);

        const files = [
            { path: '/data/media/uuid-1', name: 'a.txt' },
            { path: '/data/media/uuid-2', name: 'b.txt' },
        ];

        const archive = await createZip(files);
        expect(mockedAccess).toHaveBeenCalledTimes(2);
        expect(archive).toBeDefined();
    });

    it('should skip files that do not exist (ENOENT)', async () => {
        const enoent = Object.assign(new Error('not found'), { code: 'ENOENT' });
        mockedAccess.mockRejectedValue(enoent);

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const files = [{ path: '/data/media/missing', name: 'gone.txt' }];
        const archive = await createZip(files);

        expect(archive).toBeDefined();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('File not found'));
        warnSpy.mockRestore();
    });

    it('should log error for non-ENOENT access errors', async () => {
        const permError = Object.assign(new Error('permission denied'), { code: 'EACCES' });
        mockedAccess.mockRejectedValue(permError);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        const files = [{ path: '/data/media/noperm', name: 'locked.txt' }];
        const archive = await createZip(files);

        expect(archive).toBeDefined();
        expect(errorSpy).toHaveBeenCalledWith('Error accessing file for zip:', permError);
        errorSpy.mockRestore();
    });

    it('should handle empty files array', async () => {
        const archive = await createZip([]);
        expect(archive).toBeDefined();
    });
});
