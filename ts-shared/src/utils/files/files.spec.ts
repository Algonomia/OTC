import { FileUtils, FileUnits } from './files';

describe('FileUtils', () => {
    describe('getByteSize', () => {
        it('converts GB to bytes', () => {
            expect(FileUtils.getByteSize(1, 'GB')).toBe(1073741824);
        });

        it('converts 2 GB to bytes', () => {
            expect(FileUtils.getByteSize(2, 'GB')).toBe(2 * 1073741824);
        });

        it('converts MB to bytes', () => {
            expect(FileUtils.getByteSize(1, 'MB')).toBe(1048576);
        });

        it('converts 5 MB to bytes', () => {
            expect(FileUtils.getByteSize(5, 'MB')).toBe(5 * 1048576);
        });

        it('converts KB to bytes', () => {
            expect(FileUtils.getByteSize(1, 'KB')).toBe(1024);
        });

        it('converts 10 KB to bytes', () => {
            expect(FileUtils.getByteSize(10, 'KB')).toBe(10240);
        });

        it('returns raw bytes when unit is empty string', () => {
            expect(FileUtils.getByteSize(500, '')).toBe(500);
        });

        it('returns raw bytes when unit is omitted', () => {
            expect(FileUtils.getByteSize(500)).toBe(500);
        });

        it('returns 0 for 0 with any unit', () => {
            expect(FileUtils.getByteSize(0, 'GB')).toBe(0);
            expect(FileUtils.getByteSize(0, 'MB')).toBe(0);
            expect(FileUtils.getByteSize(0, 'KB')).toBe(0);
            expect(FileUtils.getByteSize(0, '')).toBe(0);
        });

        it('handles fractional unit sizes', () => {
            expect(FileUtils.getByteSize(0.5, 'MB')).toBe(0.5 * 1048576);
        });
    });

    describe('getUnitSize', () => {
        it('converts bytes to GB', () => {
            expect(FileUtils.getUnitSize(1073741824, 'GB')).toBe(1);
        });

        it('converts bytes to MB', () => {
            expect(FileUtils.getUnitSize(1048576, 'MB')).toBe(1);
        });

        it('converts bytes to KB', () => {
            expect(FileUtils.getUnitSize(1024, 'KB')).toBe(1);
        });

        it('returns raw bytes when unit is empty string', () => {
            expect(FileUtils.getUnitSize(500, '')).toBe(500);
        });

        it('returns raw bytes when unit is omitted', () => {
            expect(FileUtils.getUnitSize(500)).toBe(500);
        });

        it('returns 0 for 0 bytes with any unit', () => {
            expect(FileUtils.getUnitSize(0, 'GB')).toBe(0);
            expect(FileUtils.getUnitSize(0, 'MB')).toBe(0);
            expect(FileUtils.getUnitSize(0, 'KB')).toBe(0);
            expect(FileUtils.getUnitSize(0, '')).toBe(0);
        });

        it('handles non-round conversions', () => {
            expect(FileUtils.getUnitSize(512, 'KB')).toBe(0.5);
        });

        it('is the inverse of getByteSize', () => {
            const units: FileUnits[] = ['GB', 'MB', 'KB', ''];
            for (const unit of units) {
                expect(FileUtils.getUnitSize(FileUtils.getByteSize(7, unit), unit)).toBe(7);
            }
        });
    });

    describe('convertFileSize', () => {
        it('returns "0 B" for 0 bytes', () => {
            expect(FileUtils.convertFileSize(0)).toBe('0 B');
        });

        it('returns "0 B" for null', () => {
            expect(FileUtils.convertFileSize(null as any)).toBe('0 B');
        });

        it('returns "0 B" for undefined', () => {
            expect(FileUtils.convertFileSize(undefined as any)).toBe('0 B');
        });

        it('formats bytes', () => {
            expect(FileUtils.convertFileSize(500)).toBe('500 B');
        });

        it('formats exact 1 KB', () => {
            expect(FileUtils.convertFileSize(1024)).toBe('1 KB');
        });

        it('formats exact 1 MB', () => {
            expect(FileUtils.convertFileSize(1048576)).toBe('1 MB');
        });

        it('formats exact 1 GB', () => {
            expect(FileUtils.convertFileSize(1073741824)).toBe('1 GB');
        });

        it('formats exact 1 TB', () => {
            expect(FileUtils.convertFileSize(1099511627776)).toBe('1 TB');
        });

        it('formats fractional MB with default 2 decimals', () => {
            expect(FileUtils.convertFileSize(1572864)).toBe('1.5 MB');
        });

        it('formats with custom decimals', () => {
            expect(FileUtils.convertFileSize(1572864, 0)).toBe('2 MB');
        });

        it('treats negative decimals as 0', () => {
            expect(FileUtils.convertFileSize(1572864, -1)).toBe('2 MB');
        });

        it('formats a large fractional value', () => {
            expect(FileUtils.convertFileSize(5765950, 2)).toBe('5.5 MB');
        });

        it('formats 1 byte', () => {
            expect(FileUtils.convertFileSize(1)).toBe('1 B');
        });
    });

    describe('getExtensionFromFileName', () => {
        it('extracts a simple extension', () => {
            expect(FileUtils.getExtensionFromFileName('file.txt')).toBe('txt');
        });

        it('extracts extension from a name with multiple dots', () => {
            expect(FileUtils.getExtensionFromFileName('archive.tar.gz')).toBe('gz');
        });

        it('returns empty string when there is no extension', () => {
            expect(FileUtils.getExtensionFromFileName('README')).toBe('');
        });

        it('extracts extension from a dotfile with extension', () => {
            expect(FileUtils.getExtensionFromFileName('.gitignore')).toBe('gitignore');
        });

        it('extracts pdf extension', () => {
            expect(FileUtils.getExtensionFromFileName('document.pdf')).toBe('pdf');
        });

        it('extracts extension with uppercase letters', () => {
            expect(FileUtils.getExtensionFromFileName('image.PNG')).toBe('PNG');
        });

        it('returns empty string for a name ending with a dot', () => {
            expect(FileUtils.getExtensionFromFileName('file.')).toBe('');
        });

        it('extracts extension from a path-like name', () => {
            expect(FileUtils.getExtensionFromFileName('folder/subfolder/file.csv')).toBe('csv');
        });
    });

    describe('getIFile', () => {
        it('returns name, extension and size from a File object', () => {
            const mockFile = {
                name: 'report.pdf',
                size: 2048,
            } as File;

            const result = FileUtils.getIFile(mockFile);

            expect(result).toEqual({
                name: 'report.pdf',
                extension: 'pdf',
                size: 2048,
            });
        });

        it('returns empty extension for a file without extension', () => {
            const mockFile = {
                name: 'Makefile',
                size: 512,
            } as File;

            const result = FileUtils.getIFile(mockFile);

            expect(result).toEqual({
                name: 'Makefile',
                extension: '',
                size: 512,
            });
        });
    });
});
