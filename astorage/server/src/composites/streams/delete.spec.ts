jest.mock('../common/paths', () => ({
    getPath: (uuid: string) => `/data/media/${uuid}`,
}));

const mockUnlink = jest.fn();

jest.mock('fs/promises', () => ({
    unlink: (...args: any[]) => mockUnlink(...args),
}));

import { deleteFile } from './delete';

describe('deleteFile', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should unlink the file at the correct path', async () => {
        mockUnlink.mockResolvedValue(undefined);

        await deleteFile('uuid-1');
        expect(mockUnlink).toHaveBeenCalledWith('/data/media/uuid-1');
    });

    it('should silently ignore ENOENT errors', async () => {
        const enoent = Object.assign(new Error('not found'), { code: 'ENOENT' });
        mockUnlink.mockRejectedValue(enoent);

        await expect(deleteFile('uuid-missing')).resolves.toBeUndefined();
    });

    it('should throw non-ENOENT errors', async () => {
        const permError = Object.assign(new Error('permission denied'), { code: 'EACCES' });
        mockUnlink.mockRejectedValue(permError);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        await expect(deleteFile('uuid-locked')).rejects.toThrow('permission denied');
        errorSpy.mockRestore();
    });
});
