import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectFormControlComponent } from './object-form-control.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ObjectFormControlComponent', () => {
    let component: ObjectFormControlComponent;
    let fixture: ComponentFixture<ObjectFormControlComponent>;
    let formControl: FormControl<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ObjectFormControlComponent,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<any>(null);
        component.formControl = formControl;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have correct default values', () => {
            expect(component.label).toBeUndefined();
            expect(component.required).toBeUndefined();
            expect(component.placeholder).toBeUndefined();
        });
    });

    describe('JSON Parsing', () => {
        describe('Valid JSON', () => {
            it('should parse valid JSON string and update formControl', () => {
                const jsonString = '{"name":"test","value":123}';
                const event = { target: { value: jsonString } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({ name: 'test', value: 123 });
            });

            it('should parse JSON array', () => {
                const jsonArray = '[1,2,3,4,5]';
                const event = { target: { value: jsonArray } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual([1, 2, 3, 4, 5]);
            });

            it('should parse nested JSON object', () => {
                const nestedJson = '{"user":{"name":"John","age":30},"active":true}';
                const event = { target: { value: nestedJson } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({
                    user: { name: 'John', age: 30 },
                    active: true
                });
            });

            it('should parse JSON with boolean values', () => {
                const jsonWithBoolean = '{"isValid":true,"isActive":false}';
                const event = { target: { value: jsonWithBoolean } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({ isValid: true, isActive: false });
            });

            it('should parse JSON with null values', () => {
                const jsonWithNull = '{"value":null}';
                const event = { target: { value: jsonWithNull } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({ value: null });
            });

            it('should parse empty object', () => {
                const emptyObject = '{}';
                const event = { target: { value: emptyObject } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({});
            });

            it('should parse empty array', () => {
                const emptyArray = '[]';
                const event = { target: { value: emptyArray } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual([]);
            });

            it('should parse JSON with special characters', () => {
                const jsonWithSpecialChars = '{"message":"Hello \\"World\\""}';
                const event = { target: { value: jsonWithSpecialChars } } as any;

                component.onNewValue(event);

                expect(formControl.value).toEqual({ message: 'Hello "World"' });
            });
        });

        describe('Invalid JSON', () => {
            it('should handle invalid JSON and set as string', () => {
                const invalidJson = 'not a json';
                const event = { target: { value: invalidJson } } as any;

                component.onNewValue(event);

                expect(formControl.value).toBe('not a json');
            });

            it('should handle JSON parse error gracefully', () => {
                const malformedJson = '{"key": value}';
                const event = { target: { value: malformedJson } } as any;

                expect(() => {
                    component.onNewValue(event);
                }).not.toThrow();

                expect(formControl.value).toBe('{"key": value}');
            });

            it('should handle empty string', () => {
                const event = { target: { value: '' } } as any;

                component.onNewValue(event);

                expect(formControl.value).toBe('');
            });

            it('should handle whitespace string', () => {
                const event = { target: { value: '   ' } } as any;

                component.onNewValue(event);

                expect(formControl.value).toBe('   ');
            });
        });

        describe('Null/Undefined', () => {
            it('should set null when value is null', () => {
                const event = { target: { value: null } } as any;

                component.onNewValue(event);

                expect(formControl.value).toBeNull();
            });

            it('should set null when value is undefined', () => {
                const event = { target: { value: undefined } } as any;

                component.onNewValue(event);

                expect(formControl.value).toBeUndefined();
            });
        });
    });

    it('should mark formControl as touched after value change', () => {
        const event = { target: { value: '{"test":true}' } } as any;

        expect(formControl.touched).toBe(false);

        component.onNewValue(event);

        expect(formControl.touched).toBe(true);
    });

    it('should update formControl value on blur event', () => {
        const jsonString = '{"updated":true}';
        const event = { target: { value: jsonString } } as any;

        component.onNewValue(event);

        expect(formControl.value).toEqual({ updated: true });
    });

    it('should mark for check when value changes', () => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');

        const event = { target: { value: '{"test":true}' } } as any;
        component.onNewValue(event);

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    describe('Input Bindings', () => {
        it('should accept label input', () => {
            fixture.componentRef.setInput('label', 'JSON Field');
            expect(component.label).toBe('JSON Field');
        });

        it('should accept required input', () => {
            fixture.componentRef.setInput('required', true);
            expect(component.required).toBe(true);
        });

        it('should accept placeholder input', () => {
            fixture.componentRef.setInput('placeholder', 'Enter JSON');
            expect(component.placeholder).toBe('Enter JSON');
        });
    });

    it('should render FormControlTemplate when formControl exists', () => {
        fixture.detectChanges();
        const templateElement = fixture.nativeElement.querySelector('app-form-control-template');
        expect(templateElement).toBeTruthy();
    });

    it('should not render FormControlTemplate when formControl is undefined', () => {
        const newFixture = TestBed.createComponent(ObjectFormControlComponent);
        newFixture.detectChanges();

        const templateElement = newFixture.nativeElement.querySelector('app-form-control-template');
        expect(templateElement).toBeFalsy();
    });
});
