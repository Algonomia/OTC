import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableFilesComponent } from './algo-table-files.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IFile, IDownloader } from '@algonomia/ts-shared';

interface TestFile extends IFile {
    id: number;
    name: string;
}

class MockDownloader implements IDownloader<TestFile> {
    download = jasmine.createSpy('download');
    downloadZip = jasmine.createSpy('downloadZip');
}

describe('AlgoTableFilesComponent', () => {
    let component: AlgoTableFilesComponent<TestFile>;
    let fixture: ComponentFixture<AlgoTableFilesComponent<TestFile>>;
    let mockDownloader: MockDownloader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AlgoTableFilesComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableFilesComponent<TestFile>);
        component = fixture.componentInstance;
        mockDownloader = new MockDownloader();
        component.downloader = mockDownloader;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize algoIconHandler on ngOnInit', () => {
            component.ngOnInit();
            expect(component.algoIconHandler).toBeDefined();
        });

        it('should have empty files array by default', () => {
            expect(component['__files']).toEqual([]);
        });

        it('should have empty concatenated name by default', () => {
            expect(component['__concatName']).toBe('');
        });
    });

    describe('Files setter', () => {
        it('should update __files when files are set', () => {
            const files: TestFile[] = [
                { id: 1, name: 'file1.pdf' },
                { id: 2, name: 'file2.pdf' }
            ];

            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            expect(component['__files']).toEqual(files);
        });

        it('should concatenate file names with double line breaks', () => {
            const files: TestFile[] = [
                { id: 1, name: 'document1.pdf' },
                { id: 2, name: 'document2.docx' },
                { id: 3, name: 'image.png' }
            ];

            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            expect(component['__concatName']).toBe('document1.pdf\n\ndocument2.docx\n\nimage.png');
        });

        it('should handle empty files array', () => {
            fixture.componentRef.setInput('files', []);
            fixture.detectChanges();

            expect(component['__files']).toEqual([]);
            expect(component['__concatName']).toBe('');
        });

        it('should mark for check when files are set', () => {
            const changeDetectorRef = (component as any)._cd;
            spyOn(changeDetectorRef, 'markForCheck');

            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('Rendering', () => {
        it('should not render anything when files array is empty', () => {
            fixture.componentRef.setInput('files', []);
            fixture.detectChanges();

            const wrapper = fixture.nativeElement.querySelector('.wrapper');
            expect(wrapper).toBeFalsy();
        });

        it('should render wrapper when files are provided', () => {
            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            const wrapper = fixture.nativeElement.querySelector('.wrapper');
            expect(wrapper).toBeTruthy();
        });

        it('should display single file name', () => {
            const files: TestFile[] = [{ id: 1, name: 'document.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toContain('document.pdf');
        });

        it('should display file count for multiple files', () => {
            const files: TestFile[] = [
                { id: 1, name: 'file1.pdf' },
                { id: 2, name: 'file2.pdf' },
                { id: 3, name: 'file3.pdf' }
            ];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();
        });

        it('should render file icon', () => {
            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBeGreaterThan(0);
        });

        it('should render download icon', () => {
            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(2);
        });
    });

    describe('Download functionality', () => {
        it('should call download for single file', async () => {
            const file: TestFile = { id: 1, name: 'single.pdf' };
            fixture.componentRef.setInput('files', [file]);
            fixture.detectChanges();

            await component.download();

            expect(mockDownloader.download).toHaveBeenCalledWith(file);
            expect(mockDownloader.downloadZip).not.toHaveBeenCalled();
        });

        it('should call downloadZip for multiple files', async () => {
            const files: TestFile[] = [
                { id: 1, name: 'file1.pdf' },
                { id: 2, name: 'file2.pdf' }
            ];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            await component.download();

            expect(mockDownloader.downloadZip).toHaveBeenCalledWith(files);
            expect(mockDownloader.download).not.toHaveBeenCalled();
        });

        it('should not call downloader when no files', async () => {
            fixture.componentRef.setInput('files', []);
            fixture.detectChanges();

            await component.download();

            expect(mockDownloader.download).not.toHaveBeenCalled();
            expect(mockDownloader.downloadZip).not.toHaveBeenCalled();
        });

        it('should not throw error when downloader is undefined', async () => {
            component.downloader = undefined;
            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            await expectAsync(component.download()).toBeResolved();
        });

        it('should handle download errors gracefully', async () => {
            mockDownloader.download.and.throwError('Download failed');
            const file: TestFile = { id: 1, name: 'test.pdf' };
            fixture.componentRef.setInput('files', [file]);
            fixture.detectChanges();

            spyOn(console, 'error');

            await component.download();

            expect(console.error).toHaveBeenCalled();
        });

        it('should trigger download on wrapper click', () => {
            const files: TestFile[] = [{ id: 1, name: 'test.pdf' }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            spyOn(component, 'download');

            const wrapper = fixture.nativeElement.querySelector('.wrapper');
            wrapper.click();

            expect(component.download).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle files with special characters in names', () => {
            const files: TestFile[] = [
                { id: 1, name: 'file (1).pdf' },
                { id: 2, name: 'document & notes.docx' }
            ];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            expect(component['__concatName']).toContain('file (1).pdf');
            expect(component['__concatName']).toContain('document & notes.docx');
        });

        it('should handle very long file names', () => {
            const longName = 'very_long_file_name_that_exceeds_normal_length_limits.pdf';
            const files: TestFile[] = [{ id: 1, name: longName }];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            expect(component['__concatName']).toBe(longName);
        });

        it('should handle files array updates', () => {
            const files1: TestFile[] = [{ id: 1, name: 'file1.pdf' }];
            const files2: TestFile[] = [{ id: 2, name: 'file2.pdf' }];

            fixture.componentRef.setInput('files', files1);
            fixture.detectChanges();
            expect(component['__files']).toEqual(files1);

            fixture.componentRef.setInput('files', files2);
            fixture.detectChanges();
            expect(component['__files']).toEqual(files2);
        });

        it('should handle large number of files', () => {
            const manyFiles: TestFile[] = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `file${i}.pdf`
            }));
            fixture.componentRef.setInput('files', manyFiles);
            fixture.detectChanges();

            expect(component['__files'].length).toBe(100);
        });
    });

    describe('Tooltip', () => {
        it('should set tooltip with concatenated file names', () => {
            const files: TestFile[] = [
                { id: 1, name: 'file1.pdf' },
                { id: 2, name: 'file2.pdf' }
            ];
            fixture.componentRef.setInput('files', files);
            fixture.detectChanges();

            expect(component['__concatName']).toBe('file1.pdf\n\nfile2.pdf');

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();
        });
    });
});
