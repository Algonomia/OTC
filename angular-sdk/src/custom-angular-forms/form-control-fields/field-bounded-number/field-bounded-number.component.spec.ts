import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldBoundedNumberComponent } from './field-bounded-number.component';
import { NumberMeta, AlgoNumberValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { PercentageFormControlComponent } from '../../../design-elements/form-controls/percentage-form-control/percentage-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldRangeComponent', () => {
    let component: FieldBoundedNumberComponent;
    let fixture: ComponentFixture<FieldBoundedNumberComponent>;

    function createMockMetaFormControl(
        value: number | null = null,
        meta: Partial<NumberMeta> = {}
    ): MetaFormControl<number | null, NumberMeta> {
        const defaultMeta: NumberMeta = {
            label: 'Test Range',
            required: false,
            placeholder: 'Enter percentage',
            min: 0,
            max: 100,
            ...meta
        };
        const validator = new AlgoNumberValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<number | null, NumberMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldBoundedNumberComponent,
                TranslateModule.forRoot(),
                PercentageFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldBoundedNumberComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockControl = createMockMetaFormControl(50);

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
            const customMeta: Partial<NumberMeta> = {
                label: 'Completion Rate',
                required: true,
                placeholder: 'Enter completion %',
                min: 0,
                max: 100
            };
            const mockControl = createMockMetaFormControl(75, customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Completion Rate');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.min).toBe(0);
            expect(component.formControl.algoValidator.meta.max).toBe(100);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-percentage-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl(60);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeTruthy();
        });

        it('should not render app-percentage-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeNull();
        });

        it('should pass correct properties to PercentageFormControlComponent', () => {
            const mockControl = createMockMetaFormControl(80, {
                label: 'Progress',
                required: true,
                placeholder: 'Enter %',
                min: 0,
                max: 100
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeTruthy();

            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.label).toBe('Progress');
            expect(percentageComponent.required).toBe(true);
            expect(percentageComponent.placeholder).toBe('Enter %');
            expect(percentageComponent.min).toBe(0);
            expect(percentageComponent.max).toBe(100);
            expect(percentageComponent.formControls).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl(50);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeTruthy();

            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.label).toBe('Test Range');
            expect(percentageComponent.required).toBe(false);
            expect(percentageComponent.min).toBe(0);
            expect(percentageComponent.max).toBe(100);
        });

        it('should use default min/max when not provided in meta', () => {
            const mockControl = createMockMetaFormControl(50, {
                label: 'Test',
                min: undefined,
                max: undefined
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.min).toBe(0);
            expect(percentageComponent.max).toBe(100);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl(30, { label: 'Range 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            let percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.label).toBe('Range 1');

            const mockControl2 = createMockMetaFormControl(70, { label: 'Range 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.label).toBe('Range 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle formControl with zero value', () => {
            const mockControl = createMockMetaFormControl(0);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(0);
            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeTruthy();
        });

        it('should handle formControl with minimum value', () => {
            const mockControl = createMockMetaFormControl(0, { min: 0, max: 100 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(0);
            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.min).toBe(0);
        });

        it('should handle formControl with maximum value', () => {
            const mockControl = createMockMetaFormControl(100, { min: 0, max: 100 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(100);
            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.max).toBe(100);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl(50, { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl(50, { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.required).toBe(false);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            expect(percentageDebug).toBeNull();
        });

        it('should handle custom min/max range', () => {
            const mockControl = createMockMetaFormControl(50, { min: 10, max: 90 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.min).toBe(10);
            expect(percentageComponent.max).toBe(90);
        });

        it('should handle mid-range value', () => {
            const mockControl = createMockMetaFormControl(50, { min: 0, max: 100 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(50);
        });

        it('should handle decimal values', () => {
            const mockControl = createMockMetaFormControl(33.33);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(33.33);
        });

        it('should handle custom placeholder', () => {
            const mockControl = createMockMetaFormControl(75, { placeholder: 'Custom placeholder' });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const percentageDebug = fixture.debugElement.query(By.directive(PercentageFormControlComponent));
            const percentageComponent = percentageDebug.componentInstance;
            expect(percentageComponent.placeholder).toBe('Custom placeholder');
        });
    });
});
