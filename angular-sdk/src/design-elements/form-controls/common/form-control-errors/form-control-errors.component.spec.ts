import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlErrorsComponent, ToErrorTextPipe } from './form-control-errors.component';
import { TranslateModule } from '@ngx-translate/core';
import { KeyValuePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

describe('FormControlErrorsComponent', () => {
    let fixture: ComponentFixture<FormControlErrorsComponent>;
    let component: FormControlErrorsComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormControlErrorsComponent,
                KeyValuePipe,
                ToErrorTextPipe,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FormControlErrorsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept displayErrors and errors inputs', () => {
        const errors: ValidationErrors = { required: true };
        fixture.componentRef.setInput('displayErrors', false);
        fixture.componentRef.setInput('errors', errors);
        fixture.detectChanges();

        expect(component.displayErrors).toBeFalse();
        expect(component.errors).toBe(errors);
    });

    it('should render error messages if displayErrors is true and errors are provided', () => {
        const errors: ValidationErrors = { required: true };
        fixture.componentRef.setInput('errors', errors);
        fixture.detectChanges();

        const errorEl = fixture.nativeElement.querySelector('.error-message');
        expect(errorEl).toBeTruthy();
        expect(errorEl.textContent).toContain('required');
    });

    it('should not render error messages if displayErrors is false', () => {
        const errors: ValidationErrors = { required: true };
        fixture.componentRef.setInput('errors', errors);
        fixture.componentRef.setInput('displayErrors', false);
        fixture.detectChanges();

        const errorEl = fixture.nativeElement.querySelector('.error-message');
        expect(errorEl).toBeFalsy();
    });
});
