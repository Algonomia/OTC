import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MetaFormControlComponent } from './meta-form-control.component';
import { MetaFormControl, BaseMetaCompMap } from '../metaforms';
import { AValidator, BaseMeta, EValidatorType } from '@algonomia/ts-shared';

@Component({
    selector: 'app-mock-form-component',
    standalone: true,
    template: '<div>Mock Form Component</div>'
})
class MockFormComponent {}

describe('MetaFormControlComponent', () => {
    let component: MetaFormControlComponent;
    let fixture: ComponentFixture<MetaFormControlComponent>;

    function createMockMetaFormControl(validatorType: EValidatorType, value: any = null): MetaFormControl<any, any> {
        const mockValidator: AValidator<any, BaseMeta> = {
            errorCallbacks: [],
            meta: {} as BaseMeta,
            validator_type: validatorType,
            checkErrors: jasmine.createSpy('checkErrors').and.returnValue(null)
        };
        return new MetaFormControl(mockValidator, value);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MetaFormControlComponent, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MetaFormControlComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have stdCompMap as default compMap', () => {
            expect(component.compMap).toBeDefined();
        });

        it('should have undefined __component by default', () => {
            expect(component['__component']).toBeUndefined();
        });

        it('should have __renderInput function defined', () => {
            expect(component['__renderInput']).toBeDefined();
            expect(typeof component['__renderInput']).toBe('function');
        });
    });

    describe('Input Bindings', () => {
        it('should accept metaFormControl input', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text, 'test value');

            fixture.componentRef.setInput('metaFormControl', mockControl);

            expect(component.metaFormControl).toBe(mockControl);
        });

        it('should accept compMap input', () => {
            const customCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>,
                [EValidatorType.number]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            fixture.componentRef.setInput('compMap', customCompMap);

            expect(component.compMap).toBe(customCompMap);
        });
    });

    describe('ngOnChanges', () => {
        it('should set __component based on validator type', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            const customCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            component.compMap = customCompMap;
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);
        });

        it('should call markForCheck on change detector', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;
            component.compMap = mockCompMap;

            const cdSpy = spyOn(component['_cd'], 'markForCheck');

            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            expect(cdSpy).toHaveBeenCalled();
        });

        it('should handle different validator types', () => {
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>,
                [EValidatorType.number]: MockFormComponent as Type<unknown>,
                [EValidatorType.date]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            component.compMap = mockCompMap;

            // Test text type
            let mockControl = createMockMetaFormControl(EValidatorType.text);
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();
            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);

            // Test number type
            mockControl = createMockMetaFormControl(EValidatorType.number);
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();
            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);

            // Test date type
            mockControl = createMockMetaFormControl(EValidatorType.date);
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();
            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);
        });

        it('should default to text validator type when validator_type is undefined', () => {
            const mockValidator: AValidator<any, BaseMeta> = {
                errorCallbacks: [],
                meta: {} as BaseMeta,
                validator_type: undefined as any,
                checkErrors: jasmine.createSpy('checkErrors').and.returnValue(null)
            };
            const mockControl = new MetaFormControl(mockValidator, 'test');
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            component.compMap = mockCompMap;
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);
        });

        it('should update __component when validator type changes', () => {
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>,
                [EValidatorType.number]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            component.compMap = mockCompMap;

            // Initial type
            let mockControl = createMockMetaFormControl(EValidatorType.text);
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();
            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);

            // Changed type
            mockControl = createMockMetaFormControl(EValidatorType.number);
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();
            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);
        });
    });

    describe('__renderInput function', () => {
        it('should return object with formControl property', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            const result = component['__renderInput'](mockControl);

            expect(result).toEqual({ formControl: mockControl });
        });

        it('should handle different MetaFormControl instances', () => {
            const mockControl1 = createMockMetaFormControl(EValidatorType.text, 'value1');
            const mockControl2 = createMockMetaFormControl(EValidatorType.number, 123);

            const result1 = component['__renderInput'](mockControl1);
            const result2 = component['__renderInput'](mockControl2);

            expect(result1.formControl).toBe(mockControl1);
            expect(result2.formControl).toBe(mockControl2);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-render-cell when metaFormControl and __component are set', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;

            component.compMap = mockCompMap;
            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            const renderCell = fixture.nativeElement.querySelector('app-component-renderer');
            expect(renderCell).toBeTruthy();
        });

        it('should not render app-render-cell when metaFormControl is not set', () => {
            fixture.detectChanges();

            const renderCell = fixture.nativeElement.querySelector('app-component-renderer');
            expect(renderCell).toBeFalsy();
        });

        it('should not render app-render-cell when __component is not set', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            component.compMap = {} as BaseMetaCompMap; // Empty compMap, no component will be found

            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            const renderCell = fixture.nativeElement.querySelector('app-component-renderer');
            expect(renderCell).toBeFalsy();
        });
    });

    describe('Edge Cases', () => {
        it('should handle validator type not in compMap', () => {
            const mockControl = createMockMetaFormControl(EValidatorType.text);
            component.compMap = {} as BaseMetaCompMap; // Empty compMap

            fixture.componentRef.setInput('metaFormControl', mockControl);
            fixture.detectChanges();

            expect(component['__component']).toBeUndefined();
        });

        it('should handle null metaFormControl', () => {
            fixture.componentRef.setInput('metaFormControl', null);
            fixture.detectChanges();

            const renderCell = fixture.nativeElement.querySelector('app-component-renderer');
            expect(renderCell).toBeFalsy();
        });

        it('should handle multiple ngOnChanges calls', () => {
            const mockCompMap: BaseMetaCompMap = {
                [EValidatorType.text]: MockFormComponent as Type<unknown>
            } as BaseMetaCompMap;
            component.compMap = mockCompMap;

            const mockControl1 = createMockMetaFormControl(EValidatorType.text);
            fixture.componentRef.setInput('metaFormControl', mockControl1);
            fixture.detectChanges();

            const mockControl2 = createMockMetaFormControl(EValidatorType.text);
            fixture.componentRef.setInput('metaFormControl', mockControl2);
            fixture.detectChanges();

            expect(component['__component']).toBe(MockFormComponent as Type<unknown>);
        });
    });
});
