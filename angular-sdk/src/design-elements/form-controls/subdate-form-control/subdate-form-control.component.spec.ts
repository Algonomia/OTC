import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubdateFormControlComponent } from './subdate-form-control.component';
import { FormControl } from '@angular/forms';
import { EMonth, IDayMonth } from '@algonomia/ts-shared';
import { TranslateModule } from '@ngx-translate/core';

describe('SubdateFormControlComponent', () => {
    let component: SubdateFormControlComponent;
    let fixture: ComponentFixture<SubdateFormControlComponent>;
    let formControl: FormControl<Partial<IDayMonth> | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SubdateFormControlComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SubdateFormControlComponent);
        component = fixture.componentInstance;
        formControl = new FormControl<Partial<IDayMonth> | null>(null);
        component.formControl = formControl;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onValueChange', () => {
        it('should set formControl value', () => {
            const newValue: Partial<IDayMonth> = { day: 15, month: EMonth.March };
            component['onValueChange'](newValue);
            expect(formControl.value).toEqual(newValue);
        });

        it('should mark formControl as touched', () => {
            formControl.markAsUntouched();
            component['onValueChange']({ day: 10 });
            expect(formControl.touched).toBe(true);
        });

        it('should mark formControl as dirty', () => {
            component['onValueChange']({ day: 10 });
            expect(formControl.dirty).toBe(true);
        });

        it('should handle null value', () => {
            component['onValueChange'](null);
            expect(formControl.value).toBeNull();
        });

        it('should handle partial value with only day', () => {
            component['onValueChange']({ day: 25 });
            expect(formControl.value).toEqual({ day: 25 });
        });

        it('should handle partial value with only month', () => {
            component['onValueChange']({ month: EMonth.June });
            expect(formControl.value).toEqual({ month: EMonth.June });
        });
    });

    describe('FormControl Integration', () => {
        it('should initialize with null value', () => {
            expect(formControl.value).toBeNull();
        });

        it('should accept complete IDayMonth values', () => {
            formControl.setValue({ day: 15, month: EMonth.January });
            expect(formControl.value).toEqual({ day: 15, month: EMonth.January });
        });

        it('should propagate errors', () => {
            formControl.setErrors({ required: true });
            expect(formControl.errors).toEqual({ required: true });
        });

        it('should handle pristine and dirty states', () => {
            expect(formControl.pristine).toBe(true);
            formControl.markAsDirty();
            expect(formControl.dirty).toBe(true);
        });
    });
});
