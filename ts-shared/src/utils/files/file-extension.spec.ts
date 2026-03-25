import { FileExtensions } from './file-extension';

describe('FileExtensions', () => {
    describe('getIconByExtension', () => {
        it('returns the icon path for pdf', () => {
            expect(FileExtensions.getIconByExtension('pdf')).toBe('assets/images/files-type/PDF.png');
        });

        it('returns the icon path for doc', () => {
            expect(FileExtensions.getIconByExtension('doc')).toBe('assets/images/files-type/Office_Word.png');
        });

        it('returns the icon path for xlsx', () => {
            expect(FileExtensions.getIconByExtension('xlsx')).toBe('assets/images/files-type/Office_Excel.png');
        });

        it('returns the unknown icon for an unrecognized extension', () => {
            expect(FileExtensions.getIconByExtension('abc')).toBe('assets/images/files-type/Generic_unknown.png');
        });
    });

    describe('getByExtension', () => {
        it('returns the FileExtensions instance for pdf', () => {
            const result = FileExtensions.getByExtension('pdf');
            expect(result).toBe(FileExtensions.pdf);
            expect(result.extension).toBe('pdf');
        });

        it('returns the FileExtensions instance for png', () => {
            const result = FileExtensions.getByExtension('png');
            expect(result).toBe(FileExtensions.png);
        });

        it('returns unknown for an unrecognized extension', () => {
            const result = FileExtensions.getByExtension('xyz');
            expect(result).toBe(FileExtensions.unknown);
            expect(result.extension).toBe('');
        });

        it('returns unknown for an empty string', () => {
            const result = FileExtensions.getByExtension('');
            expect(result).toBe(FileExtensions.unknown);
        });
    });

    describe('getDocExtensions', () => {
        it('returns an array of FileExtensions tagged as doc', () => {
            const docExts = FileExtensions.getDocExtensions();
            expect(Array.isArray(docExts)).toBe(true);
            expect(docExts.length).toBeGreaterThan(0);
        });

        it('includes pdf, doc, docx, xls, xlsx, csv, pptx, odg, note, txt', () => {
            const docExts = FileExtensions.getDocExtensions();
            const ids = docExts.map(x => x.extension);
            expect(ids).toContain('pdf');
            expect(ids).toContain('doc');
            expect(ids).toContain('docx');
            expect(ids).toContain('xls');
            expect(ids).toContain('xlsx');
            expect(ids).toContain('csv');
            expect(ids).toContain('pptx');
            expect(ids).toContain('odg');
            expect(ids).toContain('note');
            expect(ids).toContain('txt');
        });

        it('does not include non-doc extensions', () => {
            const docExts = FileExtensions.getDocExtensions();
            const ids = docExts.map(x => x.extension);
            expect(ids).not.toContain('png');
            expect(ids).not.toContain('jpg');
            expect(ids).not.toContain('mp4');
            expect(ids).not.toContain('zip');
        });
    });

    describe('getDocExtensionIds', () => {
        it('returns an array of extension strings', () => {
            const ids = FileExtensions.getDocExtensionIds();
            expect(Array.isArray(ids)).toBe(true);
            ids.forEach(id => {
                expect(typeof id).toBe('string');
            });
        });

        it('matches the extensions from getDocExtensions', () => {
            const ids = FileExtensions.getDocExtensionIds();
            const fromDoc = FileExtensions.getDocExtensions().map(x => x.extension);
            expect(ids).toEqual(fromDoc);
        });
    });
});
