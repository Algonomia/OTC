import { Request, Response } from 'express';

const mockDiskInfo = jest.fn();
const mockServerInfo = jest.fn();

jest.mock('../composites/hardware/disk', () => ({
    diskInfo: (...args: any[]) => mockDiskInfo(...args),
}));

jest.mock('../composites/hardware/server', () => ({
    serverInfo: (...args: any[]) => mockServerInfo(...args),
}));

import { healthStatus } from './health.controller';

function mockRes(): Response {
    const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
}

describe('healthStatus', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return healthy status with disk and server info', () => {
        const disk = { filesystem: '/dev/sda1', size: '100G', used: '50G', available: '50G', usePercentage: '50%' };
        const server = { uptime: 1000, memoryUsage: {}, version: 'v20.0.0' };
        mockDiskInfo.mockReturnValue(disk);
        mockServerInfo.mockReturnValue(server);

        const res = mockRes();
        healthStatus({} as Request, res);

        expect(res.json).toHaveBeenCalledWith({
            status: 'healthy',
            timestamp: expect.any(String),
            disk,
            server,
        });
    });

    it('should return 500 with unhealthy status when diskInfo throws', () => {
        mockDiskInfo.mockImplementation(() => { throw new Error('df failed'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const res = mockRes();

        healthStatus({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'unhealthy',
            timestamp: expect.any(String),
            error: 'df failed',
        });
        errorSpy.mockRestore();
    });

    it('should return 500 when serverInfo throws', () => {
        mockDiskInfo.mockReturnValue({});
        mockServerInfo.mockImplementation(() => { throw new Error('process error'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const res = mockRes();

        healthStatus({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'unhealthy', error: 'process error' }),
        );
        errorSpy.mockRestore();
    });
});
