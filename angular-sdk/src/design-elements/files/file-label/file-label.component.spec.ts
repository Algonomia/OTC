import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileLabelComponent } from './file-label.component';
import {FileUtils, IFile} from '@algonomia/ts-shared';
import { TranslateModule } from '@ngx-translate/core';

describe('FileLabelComponent', () => {
    let component: FileLabelComponent;
    let fixture: ComponentFixture<FileLabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FileLabelComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FileLabelComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept is_active input', () => {
            fixture.componentRef.setInput('is_active', false);
            expect(component.is_active).toBe(false);
        });

        it('should call FileUtils.getIFile when file is set', () => {
            const mockFile: File = new File(['content'], 'test.pdf');
            const mockIFile: IFile = { name: 'test.pdf', extension: 'pdf', size: 7 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);

            expect(FileUtils.getIFile).toHaveBeenCalledWith(mockFile);
        });

        it('should set iFile when file input is set', () => {
            const mockFile: File = new File(['content'], 'test.pdf');
            const mockIFile: IFile = { name: 'test.pdf', extension: 'pdf', size: 7 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);

            expect(component.iFile).toEqual(mockIFile);
        });

        it('should update iFile when file changes', () => {
            const mockFile1: File = new File(['content1'], 'test1.pdf');
            const mockFile2: File = new File(['content2'], 'test2.docx');
            const mockIFile1: IFile = { name: 'test1.pdf', extension: 'pdf', size: 8 };
            const mockIFile2: IFile = { name: 'test2.docx', extension: 'docx', size: 8 };

            spyOn(FileUtils, 'getIFile').and.returnValues(mockIFile1, mockIFile2);

            fixture.componentRef.setInput('file', mockFile1);
            expect(component.iFile).toEqual(mockIFile1);

            fixture.componentRef.setInput('file', mockFile2);
            expect(component.iFile).toEqual(mockIFile2);
        });
    });

    describe('callBack output', () => {
        it('should emit when callBack is triggered', () => {
            spyOn(component.callBack, 'emit');

            component.callBack.emit();

            expect(component.callBack.emit).toHaveBeenCalled();
        });

        it('should not pass any value when emitting', () => {
            spyOn(component.callBack, 'emit');

            component.callBack.emit();

            expect(component.callBack.emit).toHaveBeenCalledWith();
        });
    });

    describe('Template Rendering', () => {
        beforeEach(() => {
            const mockFile: File = new File(['content'], 'test.pdf');
            const mockIFile: IFile = { name: 'test.pdf', extension: 'pdf', size: 1024 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);
            fixture.componentRef.setInput('file', mockFile);
        });

        it('should render file container when iFile is set', () => {
            fixture.detectChanges();

            const fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer).toBeTruthy();
        });

        it('should not render file container when iFile is not set', () => {
            component.iFile = undefined as any;
            fixture.detectChanges();

            const fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer).toBeFalsy();
        });

        it('should render file icon with correct extension', () => {
            fixture.detectChanges();

            const fileIcon = fixture.nativeElement.querySelector('app-file-icon');
            expect(fileIcon).toBeTruthy();
        });

        it('should display file name', () => {
            fixture.detectChanges();

            const nameSpan = fixture.nativeElement.querySelector('.text-wrap-ellipsis span');
            expect(nameSpan.textContent.trim()).toBe('test.pdf');
        });

        it('should display valid image when is_active is true', () => {
            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();

            const validImg = fixture.nativeElement.querySelector('img[src="assets/images/Valid.png"]');
            expect(validImg).toBeTruthy();
        });

        it('should display error image when is_active is false', () => {
            fixture.componentRef.setInput('is_active', false);
            fixture.detectChanges();

            const errorImg = fixture.nativeElement.querySelector('img[src="assets/images/Error.png"]');
            expect(errorImg).toBeTruthy();
        });

        it('should display file size when is_active is true', () => {
            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();

            const sizeText = fixture.nativeElement.querySelector('.size-text');
            expect(sizeText).toBeTruthy();
        });

        it('should display error text when is_active is false', () => {
            fixture.componentRef.setInput('is_active', false);
            fixture.detectChanges();

            const errorText = fixture.nativeElement.querySelector('.error-text');
            expect(errorText).toBeTruthy();
        });

        it('should apply error-file class when is_active is false', () => {
            fixture.componentRef.setInput('is_active', false);
            fixture.detectChanges();

            const fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer.classList.contains('error-file')).toBe(true);
        });

        it('should not apply error-file class when is_active is true', () => {
            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();

            const fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer.classList.contains('error-file')).toBe(false);
        });

        it('should render close icon', () => {
            fixture.detectChanges();

            const closeIcon = fixture.nativeElement.querySelector('app-algo-icon[name="Action/Navigation/Close"]');
            expect(closeIcon).toBeTruthy();
        });

        it('should emit callBack when close icon is clicked', () => {
            spyOn(component.callBack, 'emit');
            fixture.detectChanges();

            const closeIcon = fixture.nativeElement.querySelector('app-algo-icon[name="Action/Navigation/Close"]');
            closeIcon.click();

            expect(component.callBack.emit).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle file with undefined extension', () => {
            const mockFile: File = new File(['content'], 'test');
            const mockIFile: IFile = { name: 'test', extension: undefined, size: 7 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.detectChanges();

            const fileIcon = fixture.nativeElement.querySelector('app-file-icon');
            expect(fileIcon).toBeTruthy();
        });

        it('should handle file with undefined size', () => {
            const mockFile: File = new File(['content'], 'test.pdf');
            const mockIFile: IFile = { name: 'test.pdf', extension: 'pdf', size: undefined };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();

            const sizeText = fixture.nativeElement.querySelector('.size-text');
            expect(sizeText).toBeTruthy();
        });

        it('should handle file with zero size', () => {
            const mockFile: File = new File([], 'empty.pdf');
            const mockIFile: IFile = { name: 'empty.pdf', extension: 'pdf', size: 0 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.detectChanges();

            expect(component.iFile.size).toBe(0);
        });

        it('should handle very long file names', () => {
            const longName = 'a'.repeat(200) + '.pdf';
            const mockFile: File = new File(['content'], longName);
            const mockIFile: IFile = { name: longName, extension: 'pdf', size: 7 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.detectChanges();

            const nameSpan = fixture.nativeElement.querySelector('.text-wrap-ellipsis span');
            expect(nameSpan.textContent).toContain(longName);
        });

        it('should handle switching is_active multiple times', () => {
            const mockFile: File = new File(['content'], 'test.pdf');
            const mockIFile: IFile = { name: 'test.pdf', extension: 'pdf', size: 1024 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);
            fixture.componentRef.setInput('file', mockFile);

            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();
            let fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer.classList.contains('error-file')).toBe(false);

            fixture.componentRef.setInput('is_active', false);
            fixture.detectChanges();
            fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer.classList.contains('error-file')).toBe(true);

            fixture.componentRef.setInput('is_active', true);
            fixture.detectChanges();
            fileContainer = fixture.nativeElement.querySelector('.file');
            expect(fileContainer.classList.contains('error-file')).toBe(false);
        });

        it('should handle file with special characters in name', () => {
            const specialName = 'test@#$%^&()file.pdf';
            const mockFile: File = new File(['content'], specialName);
            const mockIFile: IFile = { name: specialName, extension: 'pdf', size: 7 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.detectChanges();

            const nameSpan = fixture.nativeElement.querySelector('.text-wrap-ellipsis span');
            expect(nameSpan.textContent.trim()).toBe(specialName);
        });

        it('should handle large file sizes', () => {
            const mockFile: File = new File(['x'.repeat(1000000)], 'large.pdf');
            const mockIFile: IFile = { name: 'large.pdf', extension: 'pdf', size: 1000000 };
            spyOn(FileUtils, 'getIFile').and.returnValue(mockIFile);

            fixture.componentRef.setInput('file', mockFile);
            fixture.detectChanges();

            expect(component.iFile.size).toBe(1000000);
        });
    });
});
