import { EventEmitter } from 'events';

jest.mock('../common/paths', () => ({
    getPath: (uuid: string) => `/data/media/${uuid}`,
}));

const mockCreateReadStream = jest.fn();

jest.mock('fs', () => ({
    createReadStream: (...args: any[]) => mockCreateReadStream(...args),
}));

import { getReadStream } from './read';

describe('getReadStream', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should create a read stream at the correct path', () => {
        const fakeStream = new EventEmitter();
        mockCreateReadStream.mockReturnValue(fakeStream);

        const result = getReadStream('uuid-1');

        expect(mockCreateReadStream).toHaveBeenCalledWith('/data/media/uuid-1', undefined);
        expect(result).toBe(fakeStream);
    });

    it('should pass encoding option when provided', () => {
        const fakeStream = new EventEmitter();
        mockCreateReadStream.mockReturnValue(fakeStream);

        getReadStream('uuid-2', 'utf8');

        expect(mockCreateReadStream).toHaveBeenCalledWith('/data/media/uuid-2', 'utf8');
    });

    it('should register an error handler on the stream', () => {
        const fakeStream = new EventEmitter();
        mockCreateReadStream.mockReturnValue(fakeStream);

        getReadStream('uuid-3');
        expect(fakeStream.listenerCount('error')).toBe(1);
    });
});
