import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PercentageFormControlComponent } from './percentage-form-control.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PercentageFormControlComponent', () => {
    let component: PercentageFormControlComponent;
    let fixture: ComponentFixture<PercentageFormControlComponent>;
    let formControl: FormControl<number | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PercentageFormControlComponent,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PercentageFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<number | null>(null);
        component.formControls = formControl;
        component.min = 0;
        component.max = 100;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have correct default values', () => {
            expect(component.label).toBeUndefined();
            expect(component.required).toBeUndefined();
            expect(component.placeholder).toBeUndefined();
            expect(component.editable).toBe(true);
        });
    });

    describe('Input Bindings', () => {
        it('should accept formControls input', () => {
            const newFormControl = new FormControl<number | null>(50);
            fixture.componentRef.setInput('formControls', newFormControl);
            expect(component.formControls).toBe(newFormControl);
        });

        it('should accept min input', () => {
            fixture.componentRef.setInput('min', 10);
            expect(component.min).toBe(10);
        });

        it('should accept max input', () => {
            fixture.componentRef.setInput('max', 90);
            expect(component.max).toBe(90);
        });

        it('should accept label input', () => {
            fixture.componentRef.setInput('label', 'Percentage Field');
            expect(component.label).toBe('Percentage Field');
        });

        it('should accept required input', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should accept placeholder input', () => {
            fixture.componentRef.setInput('placeholder', 'Enter percentage');
            expect(component.placeholder).toBe('Enter percentage');
        });

        it('should accept editable input', () => {
            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);
        });

        it('should handle multiple input changes together', () => {
            fixture.componentRef.setInput('min', 20);
            fixture.componentRef.setInput('max', 80);
            fixture.componentRef.setInput('label', 'Test Label');
            fixture.componentRef.setInput('required', true);
            fixture.componentRef.setInput('editable', false);

            expect(component.min).toBe(20);
            expect(component.max).toBe(80);
            expect(component.label).toBe('Test Label');
            expect(component.required).toBe(true);
            expect(component.editable).toBe(false);
        });
    });

    describe('FormControl Integration', () => {
        it('should initialize with null value', () => {
            expect(formControl.value).toBeNull();
        });

        it('should handle number values', () => {
            formControl.setValue(50);
            expect(formControl.value).toBe(50);
        });

        it('should handle zero value', () => {
            formControl.setValue(0);
            expect(formControl.value).toBe(0);
        });

        it('should handle maximum value', () => {
            formControl.setValue(100);
            expect(formControl.value).toBe(100);
        });

        it('should propagate touched state', () => {
            expect(formControl.touched).toBe(false);
            formControl.markAsTouched();
            expect(formControl.touched).toBe(true);
        });

        it('should propagate errors', () => {
            formControl.setErrors({ required: true });
            expect(formControl.errors).toEqual({ required: true });
        });

        it('should handle pristine and dirty states', () => {
            expect(formControl.pristine).toBe(true);
            expect(formControl.dirty).toBe(false);

            formControl.setValue(25);
            formControl.markAsDirty();

            expect(formControl.pristine).toBe(false);
            expect(formControl.dirty).toBe(true);
        });
    });

    describe('Template Rendering', () => {
        it('should render FormControlTemplate', () => {
            fixture.detectChanges();
            const formControlTemplate = fixture.nativeElement.querySelector('app-form-control-template');
            expect(formControlTemplate).toBeTruthy();
        });

        it('should render DisplayRangeInput', () => {
            fixture.detectChanges();
            const displayRangeInput = fixture.nativeElement.querySelector('app-display-range-input');
            expect(displayRangeInput).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative min value', () => {
            fixture.componentRef.setInput('min', -10);
            expect(component.min).toBe(-10);
        });

        it('should handle min equal to max', () => {
            fixture.componentRef.setInput('min', 50);
            fixture.componentRef.setInput('max', 50);
            expect(component.min).toBe(50);
            expect(component.max).toBe(50);
        });

        it('should handle large max value', () => {
            fixture.componentRef.setInput('max', 1000);
            expect(component.max).toBe(1000);
        });

        it('should handle decimal min and max values', () => {
            fixture.componentRef.setInput('min', 0.5);
            fixture.componentRef.setInput('max', 99.5);
            expect(component.min).toBe(0.5);
            expect(component.max).toBe(99.5);
        });

        it('should handle empty string label', () => {
            fixture.componentRef.setInput('label', '');
            expect(component.label).toBe('');
        });

        it('should handle empty string placeholder', () => {
            fixture.componentRef.setInput('placeholder', '');
            expect(component.placeholder).toBe('');
        });

        it('should toggle editable multiple times', () => {
            expect(component.editable).toBe(true);

            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);

            fixture.componentRef.setInput('editable', true);
            expect(component.editable).toBe(true);
        });
    });

    describe('Boolean Properties', () => {
        it('should handle required as false', () => {
            fixture.componentRef.setInput('required', false);
            expect(component.required).toBe(false);
        });

        it('should handle required as true', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should handle editable toggle', () => {
            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);

            fixture.componentRef.setInput('editable', true);
            expect(component.editable).toBe(true);
        });
    });
});
