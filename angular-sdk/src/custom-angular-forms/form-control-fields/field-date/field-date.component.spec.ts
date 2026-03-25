import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldDateComponent } from './field-date.component';
import { DateMeta, AlgoDateValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { DateFormControlComponent } from '../../../design-elements/form-controls/date-form-control/date-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldDateComponent', () => {
    let component: FieldDateComponent;
    let fixture: ComponentFixture<FieldDateComponent>;

    function createMockMetaFormControl(
        value: Date = new Date(),
        meta: Partial<DateMeta> = {}
    ): MetaFormControl<Date, DateMeta> {
        const defaultMeta: DateMeta = {
            label: 'Test Date',
            required: false,
            placeholder: 'Select date',
            minDate: new Date('2020-01-01'),
            maxDate: new Date('2030-12-31'),
            ...meta
        };
        const validator = new AlgoDateValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<Date, DateMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldDateComponent,
                TranslateModule.forRoot(),
                DateFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldDateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const testDate = new Date('2025-06-15');
            const mockControl = createMockMetaFormControl(testDate);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
        });

        it('should accept formControl with today date', () => {
            const today = new Date();
            const mockControl = createMockMetaFormControl(today);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
            expect(component.formControl.value).toBe(today);
        });

        it('should accept formControl with custom meta', () => {
            const minDate = new Date('2024-01-01');
            const maxDate = new Date('2024-12-31');
            const customMeta: Partial<DateMeta> = {
                label: 'Birth Date',
                required: true,
                placeholder: 'Select your birth date',
                minDate: minDate,
                maxDate: maxDate
            };
            const mockControl = createMockMetaFormControl(new Date('2024-06-15'), customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Birth Date');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.minDate).toBe(minDate);
            expect(component.formControl.algoValidator.meta.maxDate).toBe(maxDate);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-date-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl(new Date());

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeTruthy();
        });

        it('should not render app-date-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeNull();
        });

        it('should pass correct properties to DateFormControlComponent', () => {
            const minDate = new Date('2024-01-01');
            const maxDate = new Date('2024-12-31');
            const mockControl = createMockMetaFormControl(new Date('2024-06-15'), {
                label: 'Event Date',
                required: true,
                placeholder: 'Select event date',
                minDate: minDate,
                maxDate: maxDate
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeTruthy();

            const dateComponent = dateDebug.componentInstance;
            expect(dateComponent.label).toBe('Event Date');
            expect(dateComponent.required).toBe(true);
            expect(dateComponent.placeholder).toBe('Select event date');
            expect(dateComponent.minDate).toBe(minDate);
            expect(dateComponent.maxDate).toBe(maxDate);
            expect(dateComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl(new Date());

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeTruthy();

            const dateComponent = dateDebug.componentInstance;
            expect(dateComponent.label).toBe('Test Date');
            expect(dateComponent.required).toBe(false);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl(new Date('2024-01-01'), { label: 'Label 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            let dateComponent = dateDebug.componentInstance;
            expect(dateComponent.label).toBe('Label 1');

            const mockControl2 = createMockMetaFormControl(new Date('2024-12-31'), { label: 'Label 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            dateComponent = dateDebug.componentInstance;
            expect(dateComponent.label).toBe('Label 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle past dates', () => {
            const pastDate = new Date('1990-05-20');
            const mockControl = createMockMetaFormControl(pastDate, {
                minDate: new Date('1900-01-01')
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(pastDate);
            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeTruthy();
        });

        it('should handle future dates', () => {
            const futureDate = new Date('2030-12-31');
            const mockControl = createMockMetaFormControl(futureDate, {
                maxDate: new Date('2050-12-31')
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(futureDate);
        });

        it('should handle date at min boundary', () => {
            const minDate = new Date('2024-01-01');
            const mockControl = createMockMetaFormControl(minDate, {
                minDate: minDate,
                maxDate: new Date('2024-12-31')
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(minDate);
        });

        it('should handle date at max boundary', () => {
            const maxDate = new Date('2024-12-31');
            const mockControl = createMockMetaFormControl(maxDate, {
                minDate: new Date('2024-01-01'),
                maxDate: maxDate
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(maxDate);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl(new Date(), { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            const dateComponent = dateDebug.componentInstance;
            expect(dateComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl(new Date(), { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            const dateComponent = dateDebug.componentInstance;
            expect(dateComponent.required).toBe(false);
        });

        it('should handle minDate and maxDate constraints', () => {
            const minDate = new Date('2024-01-01');
            const maxDate = new Date('2024-12-31');
            const mockControl = createMockMetaFormControl(new Date('2024-06-15'), {
                minDate: minDate,
                maxDate: maxDate
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.algoValidator.meta.minDate).toBe(minDate);
            expect(component.formControl.algoValidator.meta.maxDate).toBe(maxDate);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const dateDebug = fixture.debugElement.query(By.directive(DateFormControlComponent));
            expect(dateDebug).toBeNull();
        });

        it('should handle leap year dates', () => {
            const leapDate = new Date('2024-02-29');
            const mockControl = createMockMetaFormControl(leapDate);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(leapDate);
        });

        it('should handle first day of year', () => {
            const firstDay = new Date('2024-01-01');
            const mockControl = createMockMetaFormControl(firstDay);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(firstDay);
        });

        it('should handle last day of year', () => {
            const lastDay = new Date('2024-12-31');
            const mockControl = createMockMetaFormControl(lastDay);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(lastDay);
        });
    });
});
