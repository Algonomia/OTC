import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingFormControlComponent } from './star-rating-form-control.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StarRatingFormControlComponent', () => {
    let component: StarRatingFormControlComponent;
    let fixture: ComponentFixture<StarRatingFormControlComponent>;
    let formControl: FormControl<number | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                StarRatingFormControlComponent,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StarRatingFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<number | null>(null);
        component.formControl = formControl;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have correct default values', () => {
            expect(component.editable).toBe(true);
            expect(component.maxRate).toBe(5);
            expect(component.label).toBeUndefined();
            expect(component.required).toBeUndefined();
        });
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const newFormControl = new FormControl<number | null>(3);
            fixture.componentRef.setInput('formControl', newFormControl);
            expect(component.formControl).toBe(newFormControl);
        });

        it('should accept editable input', () => {
            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);
        });

        it('should accept maxRate input', () => {
            fixture.componentRef.setInput('maxRate', 10);
            expect(component.maxRate).toBe(10);
        });

        it('should accept label input', () => {
            fixture.componentRef.setInput('label', 'Rating Field');
            expect(component.label).toBe('Rating Field');
        });

        it('should accept required input', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should handle multiple input changes together', () => {
            fixture.componentRef.setInput('editable', false);
            fixture.componentRef.setInput('maxRate', 10);
            fixture.componentRef.setInput('label', 'Test Rating');
            fixture.componentRef.setInput('required', true);

            expect(component.editable).toBe(false);
            expect(component.maxRate).toBe(10);
            expect(component.label).toBe('Test Rating');
            expect(component.required).toBe(true);
        });
    });

    describe('changeValue method', () => {
        it('should update formControl value when editable is true', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(4);

            expect(formControl.value).toBe(4);
        });

        it('should not update formControl when editable is false', () => {
            fixture.componentRef.setInput('editable', false);
            formControl.setValue(3);

            component.changeValue(5);

            expect(formControl.value).toBe(3);
        });

        it('should mark formControl as touched', () => {
            fixture.componentRef.setInput('editable', true);
            expect(formControl.touched).toBe(false);

            component.changeValue(3);

            expect(formControl.touched).toBe(true);
        });

        it('should not mark formControl as touched when editable is false', () => {
            fixture.componentRef.setInput('editable', false);
            expect(formControl.touched).toBe(false);

            component.changeValue(3);

            expect(formControl.touched).toBe(false);
        });

        it('should call markForCheck when editable is true', () => {
            const changeDetectorRef = (component as any)._cd;
            spyOn(changeDetectorRef, 'markForCheck');
            fixture.componentRef.setInput('editable', true);

            component.changeValue(4);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should not call markForCheck when editable is false', () => {
            const changeDetectorRef = (component as any)._cd;
            spyOn(changeDetectorRef, 'markForCheck');
            fixture.componentRef.setInput('editable', false);

            component.changeValue(4);

            expect(changeDetectorRef.markForCheck).not.toHaveBeenCalled();
        });

        it('should handle rating value of 0', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(0);

            expect(formControl.value).toBe(0);
        });

        it('should handle rating value of 1', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(1);

            expect(formControl.value).toBe(1);
        });

        it('should handle rating value equal to maxRate', () => {
            fixture.componentRef.setInput('editable', true);
            fixture.componentRef.setInput('maxRate', 5);
            component.changeValue(5);

            expect(formControl.value).toBe(5);
        });

        it('should update value multiple times', () => {
            fixture.componentRef.setInput('editable', true);

            component.changeValue(2);
            expect(formControl.value).toBe(2);

            component.changeValue(4);
            expect(formControl.value).toBe(4);

            component.changeValue(1);
            expect(formControl.value).toBe(1);
        });
    });

    describe('FormControl Integration', () => {
        it('should initialize with null value', () => {
            expect(formControl.value).toBeNull();
        });

        it('should handle number values', () => {
            formControl.setValue(3);
            expect(formControl.value).toBe(3);
        });

        it('should handle zero value', () => {
            formControl.setValue(0);
            expect(formControl.value).toBe(0);
        });

        it('should handle maximum rating value', () => {
            formControl.setValue(5);
            expect(formControl.value).toBe(5);
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

            formControl.setValue(3);
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

        it('should render DisplayRateAsStars component', () => {
            fixture.detectChanges();
            const displayRateAsStars = fixture.nativeElement.querySelector('app-display-rate-as-stars');
            expect(displayRateAsStars).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative rating values', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(-1);

            expect(formControl.value).toBe(-1);
        });

        it('should handle rating values above maxRate', () => {
            fixture.componentRef.setInput('editable', true);
            fixture.componentRef.setInput('maxRate', 5);
            component.changeValue(10);

            expect(formControl.value).toBe(10);
        });

        it('should handle decimal rating values', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(3.5);

            expect(formControl.value).toBe(3.5);
        });

        it('should handle very large maxRate', () => {
            fixture.componentRef.setInput('maxRate', 100);
            expect(component.maxRate).toBe(100);
        });

        it('should handle maxRate of 0', () => {
            fixture.componentRef.setInput('maxRate', 0);
            expect(component.maxRate).toBe(0);
        });

        it('should toggle editable state', () => {
            expect(component.editable).toBe(true);

            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);

            fixture.componentRef.setInput('editable', true);
            expect(component.editable).toBe(true);
        });

        it('should handle empty string label', () => {
            fixture.componentRef.setInput('label', '');
            expect(component.label).toBe('');
        });

        it('should handle required as false', () => {
            fixture.componentRef.setInput('required', false);
            expect(component.required).toBe(false);
        });

        it('should handle required as true', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });
    });

    describe('Editable State Behavior', () => {
        it('should allow value changes when editable is true', () => {
            fixture.componentRef.setInput('editable', true);
            const initialValue = formControl.value;

            component.changeValue(5);

            expect(formControl.value).not.toBe(initialValue);
            expect(formControl.value).toBe(5);
        });

        it('should prevent value changes when editable is false', () => {
            fixture.componentRef.setInput('editable', false);
            formControl.setValue(2);
            const initialValue = formControl.value;

            component.changeValue(5);

            expect(formControl.value).toBe(initialValue);
            expect(formControl.value).toBe(2);
        });

        it('should allow toggling editable state and changing values accordingly', () => {
            fixture.componentRef.setInput('editable', true);
            component.changeValue(3);
            expect(formControl.value).toBe(3);

            fixture.componentRef.setInput('editable', false);
            component.changeValue(5);
            expect(formControl.value).toBe(3);

            fixture.componentRef.setInput('editable', true);
            component.changeValue(4);
            expect(formControl.value).toBe(4);
        });
    });
});
