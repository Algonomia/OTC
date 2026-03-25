import { AlgoMulterFileValidator, IMulterFile } from './file-validator';

describe('AlgoMulterFileValidator', () => {
    describe('required', () => {
        const v = new AlgoMulterFileValidator({ required: true });

        it('should error on null', () => {
            expect(v.checkErrors(null as any)).toContainEqual({ required: true });
        });

        it('should error on undefined', () => {
            expect(v.checkErrors(undefined)).toContainEqual({ required: true });
        });

        it('should error on empty array', () => {
            expect(v.checkErrors([])).toContainEqual({ required: true });
        });

        it('should accept non-empty file array', () => {
            const files: IMulterFile[] = [{ originalname: 'doc.pdf', size: 100 }];
            expect(v.checkErrors(files)).toEqual([]);
        });
    });

    describe('not required', () => {
        const v = new AlgoMulterFileValidator({});

        it('should accept null without error', () => {
            expect(v.checkErrors(null as any)).toEqual([]);
        });

        it('should accept empty array without error', () => {
            expect(v.checkErrors([])).toEqual([]);
        });
    });

    describe('maxSize', () => {
        const v = new AlgoMulterFileValidator({ maxSize: 1, maxSizeUnit: 'MB' });

        it('should error when file exceeds max size', () => {
            const files: IMulterFile[] = [{ originalname: 'big.pdf', size: 2 * 1024 * 1024 }];
            const errors = v.checkErrors(files);
            expect(errors).toContainEqual({ maxSizeExceeded: files });
        });

        it('should accept file within max size', () => {
            const files: IMulterFile[] = [{ originalname: 'small.pdf', size: 500 * 1024 }];
            expect(v.checkErrors(files)).toEqual([]);
        });

        it('should accept file at exact max size', () => {
            const files: IMulterFile[] = [{ originalname: 'exact.pdf', size: 1 * 1024 * 1024 }];
            expect(v.checkErrors(files)).toEqual([]);
        });

        it('should only include oversized files in error', () => {
            const small: IMulterFile = { originalname: 'small.pdf', size: 100 };
            const big: IMulterFile = { originalname: 'big.pdf', size: 2 * 1024 * 1024 };
            const errors = v.checkErrors([small, big]);
            expect(errors).toContainEqual({ maxSizeExceeded: [big] });
        });

        it('should skip check on empty array', () => {
            expect(v.checkErrors([])).toEqual([]);
        });
    });

    describe('extensions', () => {
        const v = new AlgoMulterFileValidator({ extensions: ['pdf', 'docx'] });

        it('should error on forbidden extension', () => {
            const files: IMulterFile[] = [{ originalname: 'file.exe', size: 100 }];
            const errors = v.checkErrors(files);
            expect(errors).toContainEqual({
                forbiddenExtension: { badFiles: files, allowedExtensions: ['pdf', 'docx'] },
            });
        });

        it('should accept allowed extensions', () => {
            const files: IMulterFile[] = [{ originalname: 'doc.pdf', size: 100 }];
            expect(v.checkErrors(files)).toEqual([]);
        });

        it('should reject uppercase extension not matching lowercase accepts', () => {
            const files: IMulterFile[] = [{ originalname: 'DOC.PDF', size: 100 }];
            expect(v.checkErrors(files)).toContainEqual({
                forbiddenExtension: { badFiles: files, allowedExtensions: ['pdf', 'docx'] },
            });
        });

        it('should skip check on empty array', () => {
            expect(v.checkErrors([])).toEqual([]);
        });
    });

    describe('combined validations', () => {
        const v = new AlgoMulterFileValidator({
            required: true,
            maxSize: 5,
            maxSizeUnit: 'MB',
            extensions: ['pdf'],
        });

        it('should return multiple errors for required + no files', () => {
            expect(v.checkErrors([])).toContainEqual({ required: true });
        });

        it('should return errors for bad extension and oversized file', () => {
            const files: IMulterFile[] = [{ originalname: 'file.exe', size: 10 * 1024 * 1024 }];
            const errors = v.checkErrors(files);
            expect(errors).toContainEqual({ maxSizeExceeded: files });
            expect(errors).toContainEqual({
                forbiddenExtension: { badFiles: files, allowedExtensions: ['pdf'] },
            });
        });
    });
});
