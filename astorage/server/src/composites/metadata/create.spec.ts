import { MALWARE_SCAN_STATUS } from '../common/malware_scan_status';

const mockGet = jest.fn();

jest.mock('../common/database', () => ({
    __esModule: true,
    default: {
        prepare: jest.fn().mockReturnValue({ get: mockGet }),
    },
}));

import { createMetadata } from './create';

describe('createMetadata', () => {
    beforeEach(() => jest.clearAllMocks());

    const file = {
        originalname: 'photo.png',
        mimetype: 'image/png',
        size: 2048,
    };

    it('should insert metadata and return the created record', () => {
        const expected = {
            uuid: 'uuid-1',
            name: 'photo.png',
            mimetype: 'image/png',
            extension: 'png',
            size: 2048,
            malware_scan: 'CLEAN',
        };
        mockGet.mockReturnValue(expected);

        const result = createMetadata('uuid-1', file, undefined, MALWARE_SCAN_STATUS.CLEAN);

        expect(mockGet).toHaveBeenCalledWith(
            'uuid-1',
            'photo.png',
            'image/png',
            'png',
            2048,
            'CLEAN',
            expect.any(Number),
            null,
        );
        expect(result).toEqual(expected);
    });

    it('should default malware_scan to PENDING when not provided', () => {
        mockGet.mockReturnValue({ uuid: 'uuid-2' });

        createMetadata('uuid-2', file);

        expect(mockGet).toHaveBeenCalledWith(
            'uuid-2',
            'photo.png',
            'image/png',
            'png',
            2048,
            'PENDING',
            expect.any(Number),
            null,
        );
    });

    it('should pass additionalData when provided', () => {
        mockGet.mockReturnValue({ uuid: 'uuid-3' });

        createMetadata('uuid-3', file, '{"tag":"important"}');

        expect(mockGet).toHaveBeenCalledWith(
            'uuid-3',
            'photo.png',
            'image/png',
            'png',
            2048,
            'PENDING',
            expect.any(Number),
            '{"tag":"important"}',
        );
    });

    it('should extract extension from filename', () => {
        mockGet.mockReturnValue({ uuid: 'uuid-4' });
        const docFile = { originalname: 'report.pdf', mimetype: 'application/pdf', size: 1000 };

        createMetadata('uuid-4', docFile);

        expect(mockGet).toHaveBeenCalledWith(
            'uuid-4',
            'report.pdf',
            'application/pdf',
            'pdf',
            1000,
            'PENDING',
            expect.any(Number),
            null,
        );
    });
});
