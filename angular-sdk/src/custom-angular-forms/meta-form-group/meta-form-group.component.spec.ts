import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MetaFormGroupComponent } from './meta-form-group.component';
import { MetaFormControl, MetaFormGroup } from '../metaforms';
import { AValidator, BaseMeta } from '@algonomia/ts-shared';

describe('MetaFormGroupComponent', () => {
    let component: MetaFormGroupComponent;
    let fixture: ComponentFixture<MetaFormGroupComponent>;

    function createMockMetaFormControl(value: any = null): MetaFormControl<any, any> {
        const mockValidator: AValidator<any, BaseMeta> = {
            errorCallbacks: [],
            meta: {} as BaseMeta,
            validator_type: 'mock' as any,
            checkErrors: jasmine.createSpy('checkErrors').and.returnValue(null)
        };
        return new MetaFormControl(mockValidator, value);
    }

    function createMockMetaFormGroup(controls: Record<string, MetaFormControl<any, any>>): MetaFormGroup {
        return new MetaFormGroup(controls);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MetaFormGroupComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MetaFormGroupComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have hide_optionals as false by default', () => {
            expect(component.hide_optionals).toBe(false);
        });
    });

    describe('ngOnChanges - Keys and Masks Filtering Logic', () => {
        it('should populate __metaFormControls with all form group controls when keys is empty', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2'),
                field3: createMockMetaFormControl('value3')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(3);
        });

        it('should use specified keys to populate __metaFormControls', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2'),
                field3: createMockMetaFormControl('value3')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('keys', ['field1', 'field3']);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
            expect(component['__metaFormControls'][0]).toBe(mockFormGroup.get('field1') as MetaFormControl<any, any>);
            expect(component['__metaFormControls'][1]).toBe(mockFormGroup.get('field3') as MetaFormControl<any, any>);
        });

        it('should filter out masked keys from __metaFormControls', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2'),
                field3: createMockMetaFormControl('value3')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('masks', ['field2']);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
            expect(component['__metaFormControls'][0]).toBe(mockFormGroup.get('field1') as MetaFormControl<any, any>);
            expect(component['__metaFormControls'][1]).toBe(mockFormGroup.get('field3') as MetaFormControl<any, any>);
        });

        it('should apply both keys and masks together', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2'),
                field3: createMockMetaFormControl('value3'),
                field4: createMockMetaFormControl('value4')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('keys', ['field1', 'field2', 'field3']);
            fixture.componentRef.setInput('masks', ['field2']);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
            expect(component['__metaFormControls'][0]).toBe(mockFormGroup.get('field1') as MetaFormControl<any, any>);
            expect(component['__metaFormControls'][1]).toBe(mockFormGroup.get('field3') as MetaFormControl<any, any>);
        });

        it('should call markForCheck on change detector', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1')
            });
            const cdSpy = spyOn(component['_cd'], 'markForCheck');

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.detectChanges();

            expect(cdSpy).toHaveBeenCalled();
        });

        it('should handle empty form group', () => {
            const mockFormGroup = createMockMetaFormGroup({});

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(0);
        });

        it('should handle single field in form group', () => {
            const mockFormGroup = createMockMetaFormGroup({
                onlyField: createMockMetaFormControl('value')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(1);
            expect(component['__metaFormControls'][0]).toBe(mockFormGroup.get('onlyField') as MetaFormControl<any, any>);
        });

        it('should handle masks with non-existent fields', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('masks', ['nonExistent']);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
        });

        it('should handle all fields being masked', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('masks', ['field1', 'field2']);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(0);
        });

        it('should handle empty keys array explicitly set', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('keys', []);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
        });

        it('should handle empty masks array', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1'),
                field2: createMockMetaFormControl('value2')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.componentRef.setInput('masks', []);
            fixture.detectChanges();

            expect(component['__metaFormControls'].length).toBe(2);
        });
    });

    describe('Conditional Rendering', () => {
        it('should render app-multi-meta-form-control when metaFormGroup is provided', () => {
            const mockFormGroup = createMockMetaFormGroup({
                field1: createMockMetaFormControl('value1')
            });

            fixture.componentRef.setInput('metaFormGroup', mockFormGroup);
            fixture.detectChanges();

            const multiMetaControl = fixture.nativeElement.querySelector('app-multi-meta-form-control');
            expect(multiMetaControl).toBeTruthy();
        });

        it('should not render app-multi-meta-form-control when metaFormGroup is not provided', () => {
            fixture.detectChanges();

            const multiMetaControl = fixture.nativeElement.querySelector('app-multi-meta-form-control');
            expect(multiMetaControl).toBeFalsy();
        });
    });
});
