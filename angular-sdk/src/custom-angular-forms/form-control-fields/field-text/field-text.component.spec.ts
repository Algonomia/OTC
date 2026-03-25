import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldTextComponent } from './field-text.component';
import { StringMeta, AlgoStringValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { TextFormControlComponent } from '../../../design-elements/form-controls/text-form-control/text-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldTextComponent', () => {
    let component: FieldTextComponent;
    let fixture: ComponentFixture<FieldTextComponent>;

    function createMockMetaFormControl(
        value: string | null = null,
        meta: Partial<StringMeta> = {}
    ): MetaFormControl<string | null, StringMeta> {
        const defaultMeta: StringMeta = {
            label: 'Test Label',
            required: false,
            placeholder: 'Test Placeholder',
            minLength: 0,
            maxLength: 100,
            ...meta
        };
        const validator = new AlgoStringValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<string | null, StringMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldTextComponent,
                TranslateModule.forRoot(),
                TextFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldTextComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockControl = createMockMetaFormControl('test value');

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
            const customMeta: Partial<StringMeta> = {
                label: 'Custom Label',
                required: true,
                placeholder: 'Custom Placeholder',
                minLength: 5,
                maxLength: 50
            };
            const mockControl = createMockMetaFormControl('test', customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Custom Label');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.minLength).toBe(5);
            expect(component.formControl.algoValidator.meta.maxLength).toBe(50);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-text-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl('test value');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textFormControl = fixture.nativeElement.querySelector('app-text-form-control');
            expect(textFormControl).toBeTruthy();
        });

        it('should not render app-text-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const textFormControl = fixture.nativeElement.querySelector('app-text-form-control');
            expect(textFormControl).toBeFalsy();
        });

        it('should pass correct properties to TextFormControlComponent', () => {
            const mockControl = createMockMetaFormControl('test', {
                label: 'Username',
                required: true,
                placeholder: 'Enter username',
                minLength: 3,
                maxLength: 20
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            expect(textDebug).toBeTruthy();

            const textComponent = textDebug.componentInstance;
            expect(textComponent.label).toBe('Username');
            expect(textComponent.required).toBe(true);
            expect(textComponent.placeholder).toBe('Enter username');
            expect(textComponent.minLength).toBe(3);
            expect(textComponent.maxLength).toBe(20);
            expect(textComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl('test');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            expect(textDebug).toBeTruthy();

            const textComponent = textDebug.componentInstance;
            expect(textComponent.label).toBe('Test Label');
            expect(textComponent.required).toBe(false);
            expect(textComponent.minLength).toBe(0);
            expect(textComponent.maxLength).toBe(100);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl('value1', { label: 'Label 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            let textComponent = textDebug.componentInstance;
            expect(textComponent.label).toBe('Label 1');

            const mockControl2 = createMockMetaFormControl('value2', { label: 'Label 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            textComponent = textDebug.componentInstance;
            expect(textComponent.label).toBe('Label 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle formControl with empty string value', () => {
            const mockControl = createMockMetaFormControl('');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe('');
            const textFormControl = fixture.nativeElement.querySelector('app-text-form-control');
            expect(textFormControl).toBeTruthy();
        });

        it('should handle formControl with very long text', () => {
            const longText = 'a'.repeat(1000);
            const mockControl = createMockMetaFormControl(longText);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(longText);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl('test', { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            const textComponent = textDebug.componentInstance;
            expect(textComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl('test', { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            const textComponent = textDebug.componentInstance;
            expect(textComponent.required).toBe(false);
        });

        it('should handle minLength and maxLength constraints', () => {
            const mockControl = createMockMetaFormControl('test', {
                minLength: 10,
                maxLength: 200
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            const textComponent = textDebug.componentInstance;
            expect(textComponent.minLength).toBe(10);
            expect(textComponent.maxLength).toBe(200);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const textDebug = fixture.debugElement.query(By.directive(TextFormControlComponent));
            expect(textDebug).toBeNull();
        });

        it('should handle formControl with special characters in value', () => {
            const specialText = 'Test @#$%^&*() <script>alert("xss")</script>';
            const mockControl = createMockMetaFormControl(specialText);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(specialText);
        });
    });
});
