import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldObjectComponent } from './field-object.component';
import { ObjectMeta, TJsonObject, AlgoObjectValidator, AlgoStringValidator, StringMeta } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';

describe('FieldObjectComponent', () => {
    let component: FieldObjectComponent;
    let fixture: ComponentFixture<FieldObjectComponent>;

    function createMockMetaFormControl(
        value: TJsonObject | null = null,
        mapKeyValidator: Map<string, any> = new Map()
    ): MetaFormControl<TJsonObject | null, ObjectMeta> {
        const meta: ObjectMeta = {
            label: 'Test Object',
            required: false,
            placeholder: 'Enter JSON object',
            mapKeyValidator: mapKeyValidator
        };
        const validator = new AlgoObjectValidator(meta);
        return new MetaFormControl(validator, value) as MetaFormControl<TJsonObject | null, ObjectMeta>;
    }

    function createStringValidator(label: string): AlgoStringValidator {
        const meta: StringMeta = {
            label: label,
            required: false,
            placeholder: ''
        };
        return new AlgoStringValidator(meta);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldObjectComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldObjectComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit - Child Controls Creation', () => {
        it('should create child controls from mapKeyValidator', () => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));
            mapKeyValidator.set('email', createStringValidator('Email'));

            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            expect(component['__metaFormControls'].length).toBe(2);
        });

        it('should initialize child controls with values from parent', () => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));
            mapKeyValidator.set('age', createStringValidator('Age'));

            const mockControl = createMockMetaFormControl({ name: 'John', age: '30' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControls = component['__metaFormControls'];
            expect(childControls[0].value).toBe('John');
            expect(childControls[1].value).toBe('30');
        });

        it('should initialize child controls with null when parent value is null', () => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('field1', createStringValidator('Field 1'));

            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControls = component['__metaFormControls'];
            expect(childControls[0].value).toBeNull();
        });

        it('should initialize child controls with null when key not present in parent', () => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));
            mapKeyValidator.set('email', createStringValidator('Email'));

            const mockControl = createMockMetaFormControl({ name: 'John' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControls = component['__metaFormControls'];
            expect(childControls[0].value).toBe('John');
            expect(childControls[1].value).toBeNull();
        });

        it('should not create controls when mapKeyValidator is empty', () => {
            const mapKeyValidator = new Map<string, any>();
            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            expect(component['__metaFormControls'].length).toBe(0);
        });
    });

    describe('ngOnInit - Value Transformation Logic', () => {
        it('should create object with key when parent is null and child gets value', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));

            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControl = component['__metaFormControls'][0];
            childControl.setValue('John');

            setTimeout(() => {
                const expected = { name: 'John' };
                const actual = component.formControl.value;
                expect(actual).toEqual(expected);
                done();
            }, 10);
        });

        it('should delete key when value becomes null or undefined', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));
            mapKeyValidator.set('email', createStringValidator('Email'));

            const mockControl = createMockMetaFormControl({ name: 'John', email: 'john@example.com' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControl = component['__metaFormControls'][1];
            childControl.setValue(null);

            setTimeout(() => {
                const expected = { name: 'John' };
                const actual = component.formControl.value;
                expect(actual).toEqual(expected);
                expect(actual?.hasOwnProperty('email')).toBe(false);
                done();
            }, 10);
        });

        it('should merge values when updating existing object', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));
            mapKeyValidator.set('email', createStringValidator('Email'));

            const mockControl = createMockMetaFormControl({ name: 'John' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const emailControl = component['__metaFormControls'][1];
            emailControl.setValue('john@example.com');

            setTimeout(() => {
                const expected = { name: 'John', email: 'john@example.com' };
                const actual = component.formControl.value;
                expect(actual).toEqual(expected);
                done();
            }, 10);
        });

        it('should update existing key value', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));

            const mockControl = createMockMetaFormControl({ name: 'John' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControl = component['__metaFormControls'][0];
            childControl.setValue('Jane');

            setTimeout(() => {
                const expected = { name: 'Jane' };
                const actual = component.formControl.value;
                expect(actual).toEqual(expected);
                done();
            }, 10);
        });

        it('should convert empty object to null', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));

            const mockControl = createMockMetaFormControl({ name: 'John' }, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            component.ngOnInit();

            const childControl = component['__metaFormControls'][0];
            childControl.setValue(null);

            setTimeout(() => {
                expect(component.formControl.value).toBeNull();
                done();
            }, 10);
        });

        it('should call markAllAsTouched on parent when child value changes', (done) => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));

            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);

            spyOn(component.formControl, 'markAllAsTouched');

            component.ngOnInit();

            const childControl = component['__metaFormControls'][0];
            childControl.setValue('John');

            setTimeout(() => {
                expect(component.formControl.markAllAsTouched).toHaveBeenCalled();
                done();
            }, 10);
        });
    });

    describe('Conditional Rendering', () => {
        it('should render multi-meta-form-control when child controls exist', () => {
            const mapKeyValidator = new Map<string, any>();
            mapKeyValidator.set('name', createStringValidator('Name'));

            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const multiControl = fixture.nativeElement.querySelector('app-multi-meta-form-control');
            expect(multiControl).toBeTruthy();
        });

        it('should not render when no child controls exist', () => {
            const mapKeyValidator = new Map<string, any>();
            const mockControl = createMockMetaFormControl(null, mapKeyValidator);
            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const multiControl = fixture.nativeElement.querySelector('app-multi-meta-form-control');
            expect(multiControl).toBeFalsy();
        });
    });
});
