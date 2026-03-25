import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesFormControlComponent } from './files-form-control.component';
import { FormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

describe('FilesFormControlComponent', () => {
    let component: FilesFormControlComponent;
    let fixture: ComponentFixture<FilesFormControlComponent>;
    let formControl: FormControl<File[] | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FilesFormControlComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilesFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<File[] | null>([]);
        component.formControl = formControl;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add files to formControl', () => {
        const file1 = new File(['a'], 'a.txt');
        const file2 = new File(['b'], 'b.txt');

        component.addFormValue([file1, file2]);

        expect(formControl.value).toEqual([file1, file2]);
        expect(formControl.touched).toBeTrue();
    });

    it('should append files when adding multiple times', () => {
        const file1 = new File(['a'], 'a.txt');
        const file2 = new File(['b'], 'b.txt');

        component.addFormValue([file1]);
        component.addFormValue([file2]);

        expect(formControl.value).toEqual([file1, file2]);
    });

    it('should remove file from formControl', () => {
        const file1 = new File(['a'], 'a.txt');
        const file2 = new File(['b'], 'b.txt');
        formControl.setValue([file1, file2]);

        component.removeFormValue(file1);

        expect(formControl.value).toEqual([file2]);
    });

    it('should mark formControl as touched when removing file', () => {
        const file = new File(['a'], 'a.txt');
        formControl.setValue([file]);

        component.removeFormValue(file);

        expect(formControl.touched).toBeTrue();
    });

    it('should mark for check when updating files', () => {
        const cd = (component as any)._cd;
        spyOn(cd, 'markForCheck');

        const file = new File(['a'], 'a.txt');
        component.addFormValue([file]);

        expect(cd.markForCheck).toHaveBeenCalled();
    });
});
