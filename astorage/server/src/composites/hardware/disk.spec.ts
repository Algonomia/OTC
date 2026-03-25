jest.mock('../common/paths', () => ({
    fileStoragePath: '/tmp',
}));

describe('diskInfo', () => {
    beforeEach(() => jest.resetModules());

    it('should return parsed disk info with all expected fields', () => {
        const mockOutput = 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   60G   40G  60% /\n';

        jest.doMock('child_process', () => ({
            execSync: jest.fn().mockReturnValue(mockOutput),
        }));

        const { diskInfo } = require('./disk');
        const info = diskInfo();

        expect(info).toEqual({
            filesystem: '/dev/sda1',
            size: '100G',
            used: '60G',
            available: '40G',
            usePercentage: '60%',
        });
    });

    it('should throw when df command fails', () => {
        jest.doMock('child_process', () => ({
            execSync: jest.fn().mockImplementation(() => { throw new Error('command failed'); }),
        }));

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const { diskInfo } = require('./disk');

        expect(() => diskInfo()).toThrow('command failed');
        errorSpy.mockRestore();
    });
});
