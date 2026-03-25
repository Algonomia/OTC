import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodFormControlComponent } from './period-form-control.component';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EDayCountType, EPeriodUnit, IPeriod } from '@algonomia/ts-shared';
import {DialogService} from 'primeng/dynamicdialog';

describe('PeriodFormControlComponent', () => {
    let component: PeriodFormControlComponent;
    let fixture: ComponentFixture<PeriodFormControlComponent>;
    let formControl: FormControl<Partial<IPeriod> | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PeriodFormControlComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                DialogService,
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PeriodFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<Partial<IPeriod> | null>(null);
        component.formControl = formControl;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const newFormControl = new FormControl<Partial<IPeriod> | null>({ value: 5 });
            fixture.componentRef.setInput('formControl', newFormControl);
            expect(component.formControl).toBe(newFormControl);
        });

        it('should accept label input', () => {
            fixture.componentRef.setInput('label', 'Period Field');
            expect(component.label).toBe('Period Field');
        });

        it('should accept required input', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should accept placeholder input', () => {
            fixture.componentRef.setInput('placeholder', 'Enter value');
            expect(component.placeholder).toBe('Enter value');
        });

        it('should accept placeholder_2 input', () => {
            fixture.componentRef.setInput('placeholder_2', 'Select unit');
            expect(component.placeholder_2).toBe('Select unit');
        });

        it('should accept placeholder_3 input', () => {
            fixture.componentRef.setInput('placeholder_3', 'Select type');
            expect(component.placeholder_3).toBe('Select type');
        });
    });

    describe('onPeriodChange', () => {
        it('should update formControl value', () => {
            const period: Partial<IPeriod> = {
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            };

            component.onPeriodChange(period);

            expect(formControl.value).toEqual(period);
        });

        it('should mark formControl as touched', () => {
            component.onPeriodChange({ value: 10 });

            expect(formControl.touched).toBe(true);
        });

        it('should call markForCheck', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            component.onPeriodChange({ value: 10 });

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should handle null value', () => {
            component.onPeriodChange(null);

            expect(formControl.value).toBeNull();
        });

        it('should not update if period is equal to current value', () => {
            const period: Partial<IPeriod> = {
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            };
            formControl.setValue(period);
            spyOn(formControl, 'setValue');

            component.onPeriodChange({
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            expect(formControl.setValue).not.toHaveBeenCalled();
        });

        it('should update when unit changes', () => {
            formControl.setValue({
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            component.onPeriodChange({
                value: 10,
                unit: EPeriodUnit.Months,
                dayCountType: EDayCountType.CalendarDays
            });

            expect(formControl.value?.unit).toBe(EPeriodUnit.Months);
        });

        it('should update when dayCountType changes', () => {
            formControl.setValue({
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            component.onPeriodChange({
                value: 10,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.BusinessDays
            });

            expect(formControl.value?.dayCountType).toBe(EDayCountType.BusinessDays);
        });
    });

    describe('FormControl Integration', () => {
        it('should handle complete period object', () => {
            const period: IPeriod = {
                value: 30,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.BusinessDays
            };

            formControl.setValue(period);
            expect(formControl.value).toEqual(period);
        });

        it('should handle partial period object', () => {
            const partialPeriod: Partial<IPeriod> = { value: 5 };

            formControl.setValue(partialPeriod);
            expect(formControl.value).toEqual(partialPeriod);
        });

        it('should handle null value', () => {
            formControl.setValue(null);
            expect(formControl.value).toBeNull();
        });

        it('should propagate errors', () => {
            formControl.setErrors({ required: true });
            expect(formControl.errors).toEqual({ required: true });
        });
    });

    describe('Template Rendering', () => {
        it('should render FormControlTemplate', () => {
            fixture.detectChanges();
            const formControlTemplate = fixture.nativeElement.querySelector('app-form-control-template');
            expect(formControlTemplate).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string placeholders', () => {
            fixture.componentRef.setInput('placeholder', '');
            fixture.componentRef.setInput('placeholder_2', '');
            fixture.componentRef.setInput('placeholder_3', '');

            expect(component.placeholder).toBe('');
            expect(component.placeholder_2).toBe('');
            expect(component.placeholder_3).toBe('');
        });
    });
});
