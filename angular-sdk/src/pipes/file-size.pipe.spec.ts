import { FileSizePipe } from './file-size.pipe';
import { FileUtils } from '@algonomia/ts-shared';

describe('FileSizePipe', () => {
    let pipe: FileSizePipe;

    beforeEach(() => {
        pipe = new FileSizePipe();
    });

    it('devrait appeler FileUtils.convertFileSize avec bytes et decimals par défaut', () => {
        const bytes = 1024;
        const expected = '1 KB';

        spyOn(FileUtils, 'convertFileSize').and.returnValue(expected);
        const result = pipe.transform(bytes);

        expect(FileUtils.convertFileSize).toHaveBeenCalledWith(bytes, 2);
        expect(result).toBe(expected);
    });

    it('devrait appeler FileUtils.convertFileSize avec les decimals fournis', () => {
        const bytes = 1536;
        const decimals = 1;
        const expected = '1.5 KB';

        spyOn(FileUtils, 'convertFileSize').and.returnValue(expected);
        const result = pipe.transform(bytes, decimals);

        expect(FileUtils.convertFileSize).toHaveBeenCalledWith(bytes, decimals);
        expect(result).toBe(expected);
    });

    it('appelle FileUtils.convertFileSize avec bytes = 0', () => {
        const bytes = 0;
        spyOn(FileUtils, 'convertFileSize').and.returnValue('0 B');
        const result = pipe.transform(bytes);

        expect(FileUtils.convertFileSize).toHaveBeenCalledWith(0, 2);
        expect(result).toBe('0 B');
    });
});
