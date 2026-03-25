import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldFilesComponent } from './field-files.component';
import { FileMeta, AlgoBrowserFileValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { FilesFormControlComponent } from '../../../design-elements/form-controls/files-form-control/files-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldFilesComponent', () => {
    let component: FieldFilesComponent;
    let fixture: ComponentFixture<FieldFilesComponent>;

    function createMockFile(name: string, size: number, type: string): File {
        const blob = new Blob([''], { type });
        const file = new File([blob], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
    }

    function createMockMetaFormControl(
        value: File[] = [],
        meta: Partial<FileMeta> = {}
    ): MetaFormControl<File[], FileMeta> {
        const defaultMeta: FileMeta = {
            label: 'Test Files',
            required: false,
            placeholder: 'Select files',
            multiple: true,
            ...meta
        };
        const validator = new AlgoBrowserFileValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<File[], FileMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldFilesComponent,
                TranslateModule.forRoot(),
                FilesFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldFilesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockFiles = [createMockFile('test.pdf', 1024, 'application/pdf')];
            const mockControl = createMockMetaFormControl(mockFiles);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
        });

        it('should accept formControl with empty array', () => {
            const mockControl = createMockMetaFormControl([]);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
            expect(component.formControl.value).toEqual([]);
        });

        it('should accept formControl with custom meta', () => {
            const customMeta: Partial<FileMeta> = {
                label: 'Upload Documents',
                required: true,
                placeholder: 'Choose files',
                multiple: true,
                extensions: ['.pdf', '.docx'],
                maxSize: 5,
                maxSizeUnit: 'MB'
            };
            const mockControl = createMockMetaFormControl([], customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Upload Documents');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.extensions).toEqual(['.pdf', '.docx']);
            expect(component.formControl.algoValidator.meta.maxSize).toBe(5);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-files-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl([]);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            expect(filesDebug).toBeTruthy();
        });

        it('should not render app-files-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            expect(filesDebug).toBeNull();
        });

        it('should pass correct properties to FilesFormControlComponent', () => {
            const mockControl = createMockMetaFormControl([], {
                label: 'Upload Files',
                required: true,
                placeholder: 'Select files',
                multiple: true,
                extensions: ['.pdf', '.png']
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            expect(filesDebug).toBeTruthy();

            const filesComponent = filesDebug.componentInstance;
            expect(filesComponent.label).toBe('Upload Files');
            expect(filesComponent.required).toBe(true);
            expect(filesComponent.placeholder).toBe('Select files');
            expect(filesComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl([]);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            expect(filesDebug).toBeTruthy();

            const filesComponent = filesDebug.componentInstance;
            expect(filesComponent.label).toBe('Test Files');
            expect(filesComponent.required).toBe(false);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl([], { label: 'Files 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            let filesComponent = filesDebug.componentInstance;
            expect(filesComponent.label).toBe('Files 1');

            const mockControl2 = createMockMetaFormControl([], { label: 'Files 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            filesComponent = filesDebug.componentInstance;
            expect(filesComponent.label).toBe('Files 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle single file', () => {
            const mockFile = createMockFile('document.pdf', 2048, 'application/pdf');
            const mockControl = createMockMetaFormControl([mockFile]);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.length).toBe(1);
            expect(component.formControl.value?.[0].name).toBe('document.pdf');
        });

        it('should handle multiple files', () => {
            const mockFiles = [
                createMockFile('doc1.pdf', 1024, 'application/pdf'),
                createMockFile('doc2.pdf', 2048, 'application/pdf'),
                createMockFile('image.png', 512, 'image/png')
            ];
            const mockControl = createMockMetaFormControl(mockFiles);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.length).toBe(3);
        });

        it('should handle empty array', () => {
            const mockControl = createMockMetaFormControl([]);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toEqual([]);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl([], { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            const filesComponent = filesDebug.componentInstance;
            expect(filesComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl([], { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            const filesComponent = filesDebug.componentInstance;
            expect(filesComponent.required).toBe(false);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            expect(filesDebug).toBeNull();
        });

        it('should handle multiple: true', () => {
            const mockControl = createMockMetaFormControl([], { multiple: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.algoValidator.meta.multiple).toBe(true);
        });

        it('should handle multiple: false', () => {
            const mockControl = createMockMetaFormControl([], { multiple: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.algoValidator.meta.multiple).toBe(false);
        });

        it('should handle extensions constraint', () => {
            const mockControl = createMockMetaFormControl([], {
                extensions: ['.pdf', '.docx', '.xlsx']
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.algoValidator.meta.extensions).toEqual(['.pdf', '.docx', '.xlsx']);
        });

        it('should handle maxSize constraint', () => {
            const mockControl = createMockMetaFormControl([], {
                maxSize: 10,
                maxSizeUnit: 'MB'
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.algoValidator.meta.maxSize).toBe(10);
            expect(component.formControl.algoValidator.meta.maxSizeUnit).toBe('MB');
        });

        it('should handle files with different extensions', () => {
            const mockFiles = [
                createMockFile('document.pdf', 1024, 'application/pdf'),
                createMockFile('image.png', 512, 'image/png'),
                createMockFile('spreadsheet.xlsx', 2048, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ];
            const mockControl = createMockMetaFormControl(mockFiles);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.length).toBe(3);
            expect(component.formControl.value?.[0].name).toBe('document.pdf');
            expect(component.formControl.value?.[1].name).toBe('image.png');
            expect(component.formControl.value?.[2].name).toBe('spreadsheet.xlsx');
        });

        it('should handle files with different sizes', () => {
            const mockFiles = [
                createMockFile('small.txt', 100, 'text/plain'),
                createMockFile('medium.pdf', 1024 * 1024, 'application/pdf'),
                createMockFile('large.zip', 10 * 1024 * 1024, 'application/zip')
            ];
            const mockControl = createMockMetaFormControl(mockFiles);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.length).toBe(3);
            expect(component.formControl.value?.[0].size).toBe(100);
            expect(component.formControl.value?.[1].size).toBe(1024 * 1024);
            expect(component.formControl.value?.[2].size).toBe(10 * 1024 * 1024);
        });

        it('should handle custom placeholder', () => {
            const mockControl = createMockMetaFormControl([], { placeholder: 'Drop files here' });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const filesDebug = fixture.debugElement.query(By.directive(FilesFormControlComponent));
            const filesComponent = filesDebug.componentInstance;
            expect(filesComponent.placeholder).toBe('Drop files here');
        });
    });
});
