import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditConstantDayMonthComponent } from './edit-constant-day-month.component';
import { TranslateModule } from '@ngx-translate/core';
import { IDayMonth, IDayMonthConstant } from '@algonomia/ts-shared';

describe('EditConstantDayMonthComponent', () => {
    let component: EditConstantDayMonthComponent;
    let fixture: ComponentFixture<EditConstantDayMonthComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantDayMonthComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantDayMonthComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('changeValue method', () => {
        it('should update dayMonthComplexValue.value with input value', () => {
            const mockDayMonthConstant: Partial<IDayMonthConstant> = {
                value: { day: 1, month: 1 }
            };
            component.dayMonthComplexValue = mockDayMonthConstant as IDayMonthConstant;

            const newValue: Partial<IDayMonth> = { day: 15, month: 6 };

            component.changeValue(newValue);

            expect(component.dayMonthComplexValue.value).toEqual({ day: 15, month: 6 });
        });

        it('should call markForCheck after value change', () => {
            const mockDayMonthConstant: Partial<IDayMonthConstant> = {
                value: { day: 1, month: 1 }
            };
            component.dayMonthComplexValue = mockDayMonthConstant as IDayMonthConstant;

            const cdSpy = spyOn(component['_cd'], 'markForCheck');

            const newValue: Partial<IDayMonth> = { day: 15, month: 6 };

            component.changeValue(newValue);

            expect(cdSpy).toHaveBeenCalled();
        });

        it('should set value to undefined when input is null', () => {
            const mockDayMonthConstant: Partial<IDayMonthConstant> = {
                value: { day: 1, month: 1 }
            };
            component.dayMonthComplexValue = mockDayMonthConstant as IDayMonthConstant;

            component.changeValue(null);

            expect(component.dayMonthComplexValue.value).toBeUndefined();
        });

        it('should update with different day and month values', () => {
            const mockDayMonthConstant: Partial<IDayMonthConstant> = {
                value: { day: 1, month: 1 }
            };
            component.dayMonthComplexValue = mockDayMonthConstant as IDayMonthConstant;

            const newValue: Partial<IDayMonth> = { day: 31, month: 12 };

            component.changeValue(newValue);

            expect(component.dayMonthComplexValue.value).toEqual({ day: 31, month: 12 });
        });
    });
});
