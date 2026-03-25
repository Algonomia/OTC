import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilePlaceholderComponent } from './file-placeholder.component';
import { FileUtils } from '@algonomia/ts-shared';
import { TranslateModule } from '@ngx-translate/core';

describe('FilePlaceholderComponent', () => {
    let component: FilePlaceholderComponent;
    let fixture: ComponentFixture<FilePlaceholderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FilePlaceholderComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilePlaceholderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept multi_select input', () => {
            fixture.componentRef.setInput('multi_select', true);
            expect(component.multi_select).toBe(true);
        });

        it('should accept maxSize input', () => {
            fixture.componentRef.setInput('maxSize', 10);
            expect(component.maxSize).toBe(10);
        });

        it('should accept maxSizeUnit input', () => {
            fixture.componentRef.setInput('maxSizeUnit', 'MB');
            expect(component.maxSizeUnit).toBe('MB');
        });

        it('should accept required input', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should accept placeholder input', () => {
            fixture.componentRef.setInput('placeholder', 'Upload file');
            expect(component.placeholder).toBe('Upload file');
        });

        it('should accept allowed_extensions input', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf', 'docx']);
            expect(component['__allowedExtensions']).toBe('.pdf,.docx');
        });
    });

    describe('allowed_extensions setter', () => {
        it('should transform extensions with dot prefix', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf', 'jpg', 'png']);
            expect(component['__allowedExtensions']).toBe('.pdf,.jpg,.png');
        });

        it('should handle single extension', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf']);
            expect(component['__allowedExtensions']).toBe('.pdf');
        });

        it('should handle empty array', () => {
            fixture.componentRef.setInput('allowed_extensions', []);
            expect(component['__allowedExtensions']).toBe('');
        });

        it('should handle undefined', () => {
            fixture.componentRef.setInput('allowed_extensions', undefined);
            expect(component['__allowedExtensions']).toBe('');
        });

        it('should call markForCheck', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            fixture.componentRef.setInput('allowed_extensions', ['pdf']);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should update when extensions change', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf']);
            expect(component['__allowedExtensions']).toBe('.pdf');

            fixture.componentRef.setInput('allowed_extensions', ['docx', 'xlsx']);
            expect(component['__allowedExtensions']).toBe('.docx,.xlsx');
        });
    });

    describe('onFileSelected', () => {
        let mockEvent: any;
        let mockInput: any;
        let mockFiles: File[];

        beforeEach(() => {
            mockFiles = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];
            mockInput = {
                files: mockFiles,
                value: 'test.pdf'
            };
            mockEvent = {
                target: mockInput
            };
        });

        it('should emit filesEvent with selected files', () => {
            spyOn(component.filesEvent, 'emit');

            component.onFileSelected(mockEvent);

            expect(component.filesEvent.emit).toHaveBeenCalledWith(mockFiles);
        });

        it('should reset input value after file selection', () => {
            component.onFileSelected(mockEvent);
            expect(mockInput.value).toBe('');
        });

        it('should not emit when no files selected', () => {
            mockEvent.target.files = null;
            spyOn(component.filesEvent, 'emit');

            component.onFileSelected(mockEvent);

            expect(component.filesEvent.emit).not.toHaveBeenCalled();
        });

        it('should check max size before emitting', () => {
            spyOn(component, 'checkMaxSizeExceeded').and.returnValue(false);

            component.onFileSelected(mockEvent);

            expect(component.checkMaxSizeExceeded).toHaveBeenCalledWith(mockFiles);
        });

        it('should show alert when max size exceeded', () => {
            spyOn(component, 'checkMaxSizeExceeded').and.returnValue(true);
            spyOn(window, 'alert');
            spyOn(component.filesEvent, 'emit');
            fixture.componentRef.setInput('maxSize', 5);
            fixture.componentRef.setInput('maxSizeUnit', 'MB');

            component.onFileSelected(mockEvent);

            expect(window.alert).toHaveBeenCalledWith('Max size is 5 MB');
            expect(component.filesEvent.emit).not.toHaveBeenCalled();
        });

        it('should not reset input value when max size exceeded', () => {
            spyOn(component, 'checkMaxSizeExceeded').and.returnValue(true);
            spyOn(window, 'alert');
            fixture.componentRef.setInput('maxSize', 5);
            fixture.componentRef.setInput('maxSizeUnit', 'MB');

            component.onFileSelected(mockEvent);

            expect(mockInput.value).toBe('test.pdf');
        });

        it('should handle multiple files', () => {
            const multipleFiles = [
                new File(['content1'], 'test1.pdf'),
                new File(['content2'], 'test2.pdf')
            ];
            mockInput.files = multipleFiles;
            spyOn(component.filesEvent, 'emit');

            component.onFileSelected(mockEvent);

            expect(component.filesEvent.emit).toHaveBeenCalledWith(multipleFiles);
        });
    });

    describe('checkMaxSizeExceeded', () => {
        let mockFiles: File[];

        beforeEach(() => {
            mockFiles = [new File(['x'.repeat(1024)], 'test.pdf')];
            spyOn(FileUtils, 'getByteSize').and.returnValue(2048);
        });

        it('should return false when maxSize is null', () => {
            fixture.componentRef.setInput('maxSize', null);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(false);
        });

        it('should return false when maxSize is undefined', () => {
            fixture.componentRef.setInput('maxSize', undefined);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(false);
        });

        it('should return false when maxSize is 0', () => {
            fixture.componentRef.setInput('maxSize', 0);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(false);
        });

        it('should return false when maxSize is negative', () => {
            fixture.componentRef.setInput('maxSize', -1);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(false);
        });

        it('should call FileUtils.getByteSize with maxSize and maxSizeUnit', () => {
            fixture.componentRef.setInput('maxSize', 5);
            fixture.componentRef.setInput('maxSizeUnit', 'MB');

            component.checkMaxSizeExceeded(mockFiles);

            expect(FileUtils.getByteSize).toHaveBeenCalledWith(5, 'MB');
        });

        it('should return true when file size exceeds max', () => {
            (FileUtils.getByteSize as jasmine.Spy).and.returnValue(500);
            fixture.componentRef.setInput('maxSize', 5);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(true);
        });

        it('should return false when file size is within max', () => {
            (FileUtils.getByteSize as jasmine.Spy).and.returnValue(5000);
            fixture.componentRef.setInput('maxSize', 5);

            const result = component.checkMaxSizeExceeded(mockFiles);

            expect(result).toBe(false);
        });

        it('should return true if any file exceeds max size', () => {
            const files = [
                new File(['x'.repeat(100)], 'small.pdf'),
                new File(['x'.repeat(3000)], 'large.pdf')
            ];
            (FileUtils.getByteSize as jasmine.Spy).and.returnValue(2000);
            fixture.componentRef.setInput('maxSize', 2);

            const result = component.checkMaxSizeExceeded(files);

            expect(result).toBe(true);
        });

        it('should return false when all files are within max size', () => {
            const files = [
                new File(['x'.repeat(100)], 'small1.pdf'),
                new File(['x'.repeat(200)], 'small2.pdf')
            ];
            (FileUtils.getByteSize as jasmine.Spy).and.returnValue(5000);
            fixture.componentRef.setInput('maxSize', 5);

            const result = component.checkMaxSizeExceeded(files);

            expect(result).toBe(false);
        });
    });

    describe('Template Rendering', () => {
        it('should render hidden file input', () => {
            fixture.detectChanges();
            const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
            expect(fileInput).toBeTruthy();
            expect(fileInput.hasAttribute('hidden')).toBe(true);
        });

        it('should set multiple attribute when multi_select is true', () => {
            fixture.componentRef.setInput('multi_select', true);
            fixture.detectChanges();

            const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
            expect(fileInput.hasAttribute('multiple')).toBe(true);
        });

        it('should not set multiple attribute when multi_select is false', () => {
            fixture.componentRef.setInput('multi_select', false);
            fixture.detectChanges();

            const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
            expect(fileInput.hasAttribute('multiple')).toBe(false);
        });

        it('should set accept attribute with allowed extensions', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf', 'docx']);
            fixture.detectChanges();

            const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
            expect(fileInput.getAttribute('accept')).toBe('.pdf,.docx');
        });

        it('should render mandatory icon when required is true', () => {
            fixture.componentRef.setInput('required', true);
            fixture.detectChanges();

            const mandatoryIcon = fixture.nativeElement.querySelector('app-algo-icon[name="Action/Formatting/Mandatory"]');
            expect(mandatoryIcon).toBeTruthy();
        });

        it('should not render mandatory icon when required is false', () => {
            fixture.componentRef.setInput('required', false);
            fixture.detectChanges();

            const mandatoryIcon = fixture.nativeElement.querySelector('app-algo-icon[name="Action/Formatting/Mandatory"]');
            expect(mandatoryIcon).toBeFalsy();
        });

        it('should render cloud add icon', () => {
            fixture.detectChanges();

            const cloudIcon = fixture.nativeElement.querySelector('app-algo-icon[name="System/Storage/CloudAdd"]');
            expect(cloudIcon).toBeTruthy();
        });

        it('should trigger file input click when cta is clicked', () => {
            fixture.detectChanges();
            const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
            const cta = fixture.nativeElement.querySelector('.cta');
            spyOn(fileInput, 'click');

            cta.click();

            expect(fileInput.click).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty file list', () => {
            const emptyFiles: File[] = [];
            spyOn(component.filesEvent, 'emit');

            const mockEvent = {
                target: { files: emptyFiles, value: '' }
            };

            component.onFileSelected(mockEvent as any);

            expect(component.filesEvent.emit).toHaveBeenCalledWith(emptyFiles);
        });

        it('should handle very large maxSize values', () => {
            fixture.componentRef.setInput('maxSize', 999999);
            fixture.componentRef.setInput('maxSizeUnit', 'GB');

            expect(component.maxSize).toBe(999999);
        });

        it('should handle special characters in file extensions', () => {
            fixture.componentRef.setInput('allowed_extensions', ['pdf', 'doc-x', 'file.type']);
            expect(component['__allowedExtensions']).toBe('.pdf,.doc-x,.file.type');
        });

        it('should handle maxSizeUnit as empty string', () => {
            fixture.componentRef.setInput('maxSize', 10);
            fixture.componentRef.setInput('maxSizeUnit', '');

            spyOn(FileUtils, 'getByteSize').and.returnValue(1000);
            const files = [new File(['test'], 'test.pdf')];

            component.checkMaxSizeExceeded(files);

            expect(FileUtils.getByteSize).toHaveBeenCalledWith(10, '');
        });

        it('should handle file with exact max size', () => {
            spyOn(FileUtils, 'getByteSize').and.returnValue(1024);
            const file = new File(['x'.repeat(1024)], 'test.pdf');
            fixture.componentRef.setInput('maxSize', 1);

            const result = component.checkMaxSizeExceeded([file]);

            expect(result).toBe(false);
        });

        it('should handle file with size one byte over max', () => {
            spyOn(FileUtils, 'getByteSize').and.returnValue(1024);
            const file = new File(['x'.repeat(1025)], 'test.pdf');
            fixture.componentRef.setInput('maxSize', 1);

            const result = component.checkMaxSizeExceeded([file]);

            expect(result).toBe(true);
        });
    });
});
