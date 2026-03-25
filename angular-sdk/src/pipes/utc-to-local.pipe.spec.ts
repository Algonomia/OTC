import { UtcToLocalPipe } from './utc-to-local.pipe';
import { DateUtils } from '@algonomia/ts-shared';

describe('UtcToLocalPipe', () => {
    let pipe: UtcToLocalPipe;

    beforeEach(() => {
        pipe = new UtcToLocalPipe();
    });

    it('should call DateUtils.utcToLocal with the provided date', () => {
        const date = new Date('2024-01-01T12:00:00Z');
        const expected = new Date('2024-01-01T13:00:00');

        spyOn(DateUtils, 'utcToLocal').and.returnValue(expected);

        const result = pipe.transform(date);

        expect(DateUtils.utcToLocal).toHaveBeenCalledWith(date);
        expect(result).toBe(expected);
    });

    it('should return the value returned by DateUtils.utcToLocal for null', () => {
        spyOn(DateUtils, 'utcToLocal').and.returnValue(undefined);

        const result = pipe.transform(null);

        expect(DateUtils.utcToLocal).toHaveBeenCalledWith(null);
        expect(result).toBeUndefined();
    });

    it('should return the value returned by DateUtils.utcToLocal for undefined', () => {
        spyOn(DateUtils, 'utcToLocal').and.returnValue(undefined);

        const result = pipe.transform(undefined);

        expect(DateUtils.utcToLocal).toHaveBeenCalledWith(undefined);
        expect(result).toBeUndefined();
    });
});
