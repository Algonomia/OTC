import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldNumberComponent } from './field-number.component';
import { NumberMeta, AlgoNumberValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { NumberFormControlComponent } from '../../../design-elements/form-controls/number-form-control/number-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldNumberComponent', () => {
    let component: FieldNumberComponent;
    let fixture: ComponentFixture<FieldNumberComponent>;

    function createMockMetaFormControl(
        value: number | null = null,
        meta: Partial<NumberMeta> = {}
    ): MetaFormControl<number | null, NumberMeta> {
        const defaultMeta: NumberMeta = {
            label: 'Test Number',
            required: false,
            placeholder: 'Enter number',
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
                FieldNumberComponent,
                TranslateModule.forRoot(),
                NumberFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldNumberComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockControl = createMockMetaFormControl(42);

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
                label: 'Age',
                required: true,
                placeholder: 'Enter age',
                min: 18,
                max: 120
            };
            const mockControl = createMockMetaFormControl(25, customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Age');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.min).toBe(18);
            expect(component.formControl.algoValidator.meta.max).toBe(120);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-number-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl(50);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberFormControl = fixture.nativeElement.querySelector('app-number-form-control');
            expect(numberFormControl).toBeTruthy();
        });

        it('should not render app-number-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const numberFormControl = fixture.nativeElement.querySelector('app-number-form-control');
            expect(numberFormControl).toBeFalsy();
        });

        it('should pass correct properties to NumberFormControlComponent', () => {
            const mockControl = createMockMetaFormControl(30, {
                label: 'Quantity',
                required: true,
                placeholder: 'Enter quantity',
                min: 1,
                max: 999
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            expect(numberDebug).toBeTruthy();

            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.label).toBe('Quantity');
            expect(numberComponent.required).toBe(true);
            expect(numberComponent.placeholder).toBe('Enter quantity');
            expect(numberComponent.min).toBe(1);
            expect(numberComponent.max).toBe(999);
            expect(numberComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl(5);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            expect(numberDebug).toBeTruthy();

            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.label).toBe('Test Number');
            expect(numberComponent.required).toBe(false);
            expect(numberComponent.min).toBe(0);
            expect(numberComponent.max).toBe(100);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl(10, { label: 'Label 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            let numberComponent = numberDebug.componentInstance;
            expect(numberComponent.label).toBe('Label 1');

            const mockControl2 = createMockMetaFormControl(20, { label: 'Label 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            numberComponent = numberDebug.componentInstance;
            expect(numberComponent.label).toBe('Label 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle formControl with zero value', () => {
            const mockControl = createMockMetaFormControl(0);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(0);
            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            expect(numberDebug).toBeTruthy();
        });

        it('should handle formControl with negative numbers', () => {
            const mockControl = createMockMetaFormControl(-50, { min: -100, max: 0 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(-50);
            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.min).toBe(-100);
            expect(numberComponent.max).toBe(0);
        });

        it('should handle formControl with decimal numbers', () => {
            const mockControl = createMockMetaFormControl(3.14159);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(3.14159);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl(42, { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl(42, { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.required).toBe(false);
        });

        it('should handle min and max constraints', () => {
            const mockControl = createMockMetaFormControl(50, {
                min: 10,
                max: 200
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.min).toBe(10);
            expect(numberComponent.max).toBe(200);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            expect(numberDebug).toBeNull();
        });

        it('should handle very large numbers', () => {
            const largeNumber = 999999999;
            const mockControl = createMockMetaFormControl(largeNumber);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(largeNumber);
        });

        it('should handle very small numbers', () => {
            const smallNumber = 0.00001;
            const mockControl = createMockMetaFormControl(smallNumber);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(smallNumber);
        });

        it('should handle min/max of zero', () => {
            const mockControl = createMockMetaFormControl(0, {
                min: 0,
                max: 0
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const numberDebug = fixture.debugElement.query(By.directive(NumberFormControlComponent));
            const numberComponent = numberDebug.componentInstance;
            expect(numberComponent.min).toBe(0);
            expect(numberComponent.max).toBe(0);
        });
    });
});
