import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DateFormControlComponent } from './date-form-control.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DateFormControlComponent', () => {
    let component: DateFormControlComponent;
    let fixture: ComponentFixture<DateFormControlComponent>;
    let formControl: FormControl<Date | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                DateFormControlComponent,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DateFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<Date | null>(null);
        component.formControl = formControl;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with formControl value', fakeAsync(() => {
        const testDate = new Date('2024-01-15');
        formControl.setValue(testDate);
        fixture.detectChanges();
        expect(component['__value$'].getValue()).toBe(testDate);
    }));

    it('should initialize with null when formControl has no value', fakeAsync(() => {
        fixture.detectChanges();
        expect(component['__value$'].getValue()).toBeNull();
    }));

    it('should update formControl when date is changed', fakeAsync(() => {
        fixture.detectChanges();

        const testDate = new Date('2024-01-15');

        component.onDateChange(testDate);
        tick();

        expect(formControl.value).toEqual(testDate);
    }));

    it('should mark formControl as touched when date is changed', fakeAsync(() => {
        fixture.detectChanges();
        expect(formControl.touched).toBe(false);

        component.onDateChange(new Date('2024-01-15'));
        tick();

        expect(formControl.touched).toBe(true);
    }));

    it('should handle null date in onDateChange', fakeAsync(() => {
        fixture.detectChanges();
        component.onDateChange(null);
        tick();

        expect(formControl.value).toBeNull();
    }));

    it('should sync internal value when formControl value changes externally', fakeAsync(() => {
        fixture.detectChanges();
        tick();

        const testDate = new Date('2024-01-15');
        formControl.setValue(testDate);
        tick();

        expect(component['__value$'].getValue()).toBe(testDate);
    }));

    it('should not update formControl if value is the same', fakeAsync(() => {
        const testDate = new Date('2024-01-15');
        formControl.setValue(testDate);

        fixture.detectChanges();
        tick();

        spyOn(formControl, 'setValue');

        component['__value$'].next(testDate);

        expect(formControl.setValue).not.toHaveBeenCalled();
    }));

    it('should not update internal value if already the same', fakeAsync(() => {
        const testDate = new Date('2024-01-15');
        fixture.detectChanges();
        component['__value$'].next(testDate);

        formControl.setValue(testDate);
        expect(component['__value$'].getValue()).toBe(testDate);
    }));

    it('should accept minDate input', () => {
        const minDate = new Date('2024-01-01');
        fixture.componentRef.setInput('minDate', minDate);
        expect(component.minDate).toBe(minDate);
    });

    it('should accept maxDate input', () => {
        const maxDate = new Date('2024-12-31');
        fixture.componentRef.setInput('maxDate', maxDate);
        expect(component.maxDate).toBe(maxDate);
    });

    it('should accept placeholder input', () => {
        fixture.componentRef.setInput('placeholder', 'Select a date');
        expect(component.placeholder).toBe('Select a date');
    });

    it('should accept label input', () => {
        fixture.componentRef.setInput('label', 'Date Field');
        expect(component.label).toBe('Date Field');
    });

    it('should accept required input', () => {
        fixture.componentRef.setInput('required', true);
        expect(component.required).toBe(true);
    });

    it('should mark for check when date changes', fakeAsync(() => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');

        fixture.detectChanges();
        component.onDateChange(new Date('2024-01-15'));

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    }));

    it('should pass errors to template when formControl is touched', () => {
        formControl.setErrors({ required: true });
        formControl.markAsTouched();
        fixture.detectChanges();

        expect(formControl.errors).toEqual({ required: true });
        expect(formControl.touched).toBe(true);
    });

    it('should unsubscribe on destroy', fakeAsync(() => {
        fixture.detectChanges();
        const initialValue = component['__value$'].getValue();
        component.ngOnDestroy();
        formControl.setValue(new Date('2024-01-15'));

        expect(component['__value$'].getValue()).toBe(initialValue);
    }));
});
