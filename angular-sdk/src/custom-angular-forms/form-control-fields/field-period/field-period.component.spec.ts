import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldPeriodComponent } from './field-period.component';
import { PeriodMeta, IPeriod, AlgoPeriodValidator, EPeriodUnit, EDayCountType } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { PeriodFormControlComponent } from '../../../design-elements/form-controls/period-form-control/period-form-control.component';
import { By } from '@angular/platform-browser';
import {DialogService} from 'primeng/dynamicdialog';

describe('FieldPeriodComponent', () => {
    let component: FieldPeriodComponent;
    let fixture: ComponentFixture<FieldPeriodComponent>;

    function createMockMetaFormControl(
        value: IPeriod | null = null,
        meta: Partial<PeriodMeta> = {}
    ): MetaFormControl<IPeriod | null, PeriodMeta> {
        const defaultMeta: PeriodMeta = {
            label: 'Test Period',
            required: false,
            placeholder: 'Value',
            placeholder_2: 'Unit',
            placeholder_3: 'Day Count',
            ...meta
        };
        const validator = new AlgoPeriodValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<IPeriod | null, PeriodMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldPeriodComponent,
                TranslateModule.forRoot(),
                PeriodFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                DialogService,
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldPeriodComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockControl = createMockMetaFormControl({
                value: 30,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
        });

        it('should accept formControl with null value', () => {
            const mockControl = createMockMetaFormControl(null);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl).toBe(mockControl);
            expect(component.formControl.value).toBeNull();
        });

        it('should accept formControl with custom meta', () => {
            const customMeta: Partial<PeriodMeta> = {
                label: 'Payment Period',
                required: true,
                placeholder: 'Enter value',
                placeholder_2: 'Select unit',
                placeholder_3: 'Select day count'
            };
            const mockControl = createMockMetaFormControl({
                value: 6,
                unit: EPeriodUnit.Months,
                dayCountType: EDayCountType.BusinessDays
            }, customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Payment Period');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.placeholder).toBe('Enter value');
            expect(component.formControl.algoValidator.meta.placeholder_2).toBe('Select unit');
            expect(component.formControl.algoValidator.meta.placeholder_3).toBe('Select day count');
        });
    });

    describe('Template Rendering', () => {
        it('should render app-period-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl({
                value: 7,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.WeekDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            expect(periodDebug).toBeTruthy();
        });

        it('should not render app-period-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            expect(periodDebug).toBeNull();
        });

        it('should pass correct properties to PeriodFormControlComponent', () => {
            const mockControl = createMockMetaFormControl({
                value: 12,
                unit: EPeriodUnit.Months,
                dayCountType: EDayCountType.BusinessDays
            }, {
                label: 'Duration',
                required: true,
                placeholder: 'Number',
                placeholder_2: 'Time unit',
                placeholder_3: 'Count type'
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            expect(periodDebug).toBeTruthy();

            const periodComponent = periodDebug.componentInstance;
            expect(periodComponent.label).toBe('Duration');
            expect(periodComponent.required).toBe(true);
            expect(periodComponent.placeholder).toBe('Number');
            expect(periodComponent.placeholder_2).toBe('Time unit');
            expect(periodComponent.placeholder_3).toBe('Count type');
            expect(periodComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl({
                value: 1,
                unit: EPeriodUnit.Weeks,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            expect(periodDebug).toBeTruthy();

            const periodComponent = periodDebug.componentInstance;
            expect(periodComponent.label).toBe('Test Period');
            expect(periodComponent.required).toBe(false);
            expect(periodComponent.placeholder).toBe('Value');
            expect(periodComponent.placeholder_2).toBe('Unit');
            expect(periodComponent.placeholder_3).toBe('Day Count');
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl({
                value: 1,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            }, { label: 'Period 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            let periodComponent = periodDebug.componentInstance;
            expect(periodComponent.label).toBe('Period 1');

            const mockControl2 = createMockMetaFormControl({
                value: 2,
                unit: EPeriodUnit.Weeks,
                dayCountType: EDayCountType.WeekDays
            }, { label: 'Period 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            periodComponent = periodDebug.componentInstance;
            expect(periodComponent.label).toBe('Period 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle period with Days unit', () => {
            const mockControl = createMockMetaFormControl({
                value: 15,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.unit).toBe(EPeriodUnit.Days);
        });

        it('should handle period with Weeks unit', () => {
            const mockControl = createMockMetaFormControl({
                value: 2,
                unit: EPeriodUnit.Weeks,
                dayCountType: EDayCountType.WeekDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.unit).toBe(EPeriodUnit.Weeks);
        });

        it('should handle period with Months unit', () => {
            const mockControl = createMockMetaFormControl({
                value: 6,
                unit: EPeriodUnit.Months,
                dayCountType: EDayCountType.BusinessDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.unit).toBe(EPeriodUnit.Months);
        });

        it('should handle period with Years unit', () => {
            const mockControl = createMockMetaFormControl({
                value: 1,
                unit: EPeriodUnit.Years,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.unit).toBe(EPeriodUnit.Years);
        });

        it('should handle different day count types', () => {
            const dayCountTypes = [
                EDayCountType.Default,
                EDayCountType.CalendarDays,
                EDayCountType.WeekDays,
                EDayCountType.BusinessDays
            ];

            dayCountTypes.forEach(dayCountType => {
                const mockControl = createMockMetaFormControl({
                    value: 10,
                    unit: EPeriodUnit.Days,
                    dayCountType
                });
                fixture.componentRef.setInput('formControl', mockControl);
                fixture.detectChanges();

                expect(component.formControl.value?.dayCountType).toBe(dayCountType);
            });
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl({
                value: 5,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            }, { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            const periodComponent = periodDebug.componentInstance;
            expect(periodComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl({
                value: 5,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            }, { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            const periodComponent = periodDebug.componentInstance;
            expect(periodComponent.required).toBe(false);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const periodDebug = fixture.debugElement.query(By.directive(PeriodFormControlComponent));
            expect(periodDebug).toBeNull();
        });

        it('should handle zero value', () => {
            const mockControl = createMockMetaFormControl({
                value: 0,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.value).toBe(0);
        });

        it('should handle large value', () => {
            const mockControl = createMockMetaFormControl({
                value: 365,
                unit: EPeriodUnit.Days,
                dayCountType: EDayCountType.CalendarDays
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value?.value).toBe(365);
        });
    });
});
