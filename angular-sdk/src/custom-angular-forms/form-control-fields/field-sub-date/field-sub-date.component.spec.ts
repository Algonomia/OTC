import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldSubDateComponent } from './field-sub-date.component';
import { DayMonthMeta, IDayMonth, AlgoDayMonthValidator, EMonth } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { SubdateFormControlComponent } from '../../../design-elements/form-controls/subdate-form-control/subdate-form-control.component';
import { By } from '@angular/platform-browser';
import {DialogService} from 'primeng/dynamicdialog';

describe('FieldSubDateComponent', () => {
    let component: FieldSubDateComponent;
    let fixture: ComponentFixture<FieldSubDateComponent>;

    function createMockMetaFormControl(
        value: IDayMonth | null = null,
        meta: Partial<DayMonthMeta> = {}
    ): MetaFormControl<IDayMonth | null, DayMonthMeta> {
        const defaultMeta: DayMonthMeta = {
            label: 'Test Date Label',
            required: false,
            placeholder: 'Day',
            placeholder_2: 'Month',
            ...meta
        };
        const validator = new AlgoDayMonthValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<IDayMonth | null, DayMonthMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FieldSubDateComponent, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                DialogService,
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldSubDateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should pass correct properties to SubdateFormControlComponent', () => {
        const mockControl = createMockMetaFormControl({ day: 25, month: EMonth.December }, {
            label: 'Birth Date',
            required: true,
            placeholder: 'Enter day',
            placeholder_2: 'Enter month'
        });

        fixture.componentRef.setInput('formControl', mockControl);
        fixture.detectChanges();

        const subdateDebug = fixture.debugElement.query(By.directive(SubdateFormControlComponent));
        expect(subdateDebug).toBeTruthy();

        const subdateComponent = subdateDebug.componentInstance;
        expect(subdateComponent.label).toBe('Birth Date');
        expect(subdateComponent.required).toBe(true);
        expect(subdateComponent.placeholder).toBe('Enter day');
        expect(subdateComponent.placeholder_2).toBe('Enter month');
        expect(subdateComponent.formControl).toBe(mockControl);
    });
});
