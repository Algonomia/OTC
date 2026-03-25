import { MALWARE_SCAN_STATUS } from '../common/malware_scan_status';

const mockGetError = jest.fn();
const mockGetScan = jest.fn();

jest.mock('../common/database', () => ({
    __esModule: true,
    default: {
        prepare: jest.fn().mockImplementation((query: string) => {
            if (query.includes('SET error')) return { get: mockGetError };
            return { get: mockGetScan };
        }),
    },
}));

import { updateError, updateMalwareScan } from './update';

describe('updateError', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should update error field and return updated record', () => {
        const updated = { uuid: 'u1', error: 'read failure' };
        mockGetError.mockReturnValue(updated);

        const result = updateError('u1', 'read failure');
        expect(mockGetError).toHaveBeenCalledWith('read failure', 'u1');
        expect(result).toEqual(updated);
    });
});

describe('updateMalwareScan', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should update malware_scan and return updated record', () => {
        const updated = { uuid: 'u2', malware_scan: 'INFECTED' };
        mockGetScan.mockReturnValue(updated);

        const result = updateMalwareScan('u2', MALWARE_SCAN_STATUS.INFECTED);
        expect(mockGetScan).toHaveBeenCalledWith('INFECTED', 'u2');
        expect(result).toEqual(updated);
    });

    it('should handle CLEAN status', () => {
        const updated = { uuid: 'u3', malware_scan: 'CLEAN' };
        mockGetScan.mockReturnValue(updated);

        const result = updateMalwareScan('u3', MALWARE_SCAN_STATUS.CLEAN);
        expect(mockGetScan).toHaveBeenCalledWith('CLEAN', 'u3');
        expect(result).toEqual(updated);
    });
});
