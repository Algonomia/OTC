import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldRateComponent } from './field-rate.component';
import { RateMeta, AlgoRateValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { StarRatingFormControlComponent } from '../../../design-elements/form-controls/star-rating-form-control/star-rating-form-control.component';
import { By } from '@angular/platform-browser';

describe('FieldRateComponent', () => {
    let component: FieldRateComponent;
    let fixture: ComponentFixture<FieldRateComponent>;

    function createMockMetaFormControl(
        value: number | null = null,
        meta: Partial<RateMeta> = {}
    ): MetaFormControl<number | null, RateMeta> {
        const defaultMeta: RateMeta = {
            label: 'Test Rating',
            required: false,
            maxRate: 5,
            ...meta
        };
        const validator = new AlgoRateValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<number | null, RateMeta>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldRateComponent,
                TranslateModule.forRoot(),
                StarRatingFormControlComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldRateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept formControl input', () => {
            const mockControl = createMockMetaFormControl(3);

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
            const customMeta: Partial<RateMeta> = {
                label: 'Product Rating',
                required: true,
                maxRate: 10
            };
            const mockControl = createMockMetaFormControl(8, customMeta);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component.formControl.algoValidator.meta.label).toBe('Product Rating');
            expect(component.formControl.algoValidator.meta.required).toBe(true);
            expect(component.formControl.algoValidator.meta.maxRate).toBe(10);
        });
    });

    describe('Template Rendering', () => {
        it('should render app-star-rating-form-control when formControl is provided', () => {
            const mockControl = createMockMetaFormControl(4);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeTruthy();
        });

        it('should not render app-star-rating-form-control when formControl is not provided', () => {
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeNull();
        });

        it('should pass correct properties to StarRatingFormControlComponent', () => {
            const mockControl = createMockMetaFormControl(4, {
                label: 'Service Quality',
                required: true,
                maxRate: 10
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeTruthy();

            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.label).toBe('Service Quality');
            expect(starRatingComponent.required).toBe(true);
            expect(starRatingComponent.maxRate).toBe(10);
            expect(starRatingComponent.formControl).toBe(mockControl);
        });

        it('should pass default meta values when not specified', () => {
            const mockControl = createMockMetaFormControl(3);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeTruthy();

            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.label).toBe('Test Rating');
            expect(starRatingComponent.required).toBe(false);
            expect(starRatingComponent.maxRate).toBe(5);
        });

        it('should update rendered component when formControl changes', () => {
            const mockControl1 = createMockMetaFormControl(2, { label: 'Rating 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            let starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.label).toBe('Rating 1');

            const mockControl2 = createMockMetaFormControl(4, { label: 'Rating 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.label).toBe('Rating 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle formControl with minimum rating (1)', () => {
            const mockControl = createMockMetaFormControl(1);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(1);
            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeTruthy();
        });

        it('should handle formControl with maximum rating', () => {
            const mockControl = createMockMetaFormControl(5, { maxRate: 5 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(5);
            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.maxRate).toBe(5);
        });

        it('should handle formControl with zero value', () => {
            const mockControl = createMockMetaFormControl(0);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(0);
        });

        it('should handle required field', () => {
            const mockControl = createMockMetaFormControl(3, { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockMetaFormControl(3, { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.required).toBe(false);
        });

        it('should handle null formControl gracefully', () => {
            fixture.componentRef.setInput('formControl', null);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            expect(starRatingDebug).toBeNull();
        });

        it('should handle different maxRate values', () => {
            const testCases = [3, 5, 7, 10];

            testCases.forEach(maxRate => {
                const mockControl = createMockMetaFormControl(maxRate, { maxRate });
                fixture.componentRef.setInput('formControl', mockControl);
                fixture.detectChanges();

                const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
                const starRatingComponent = starRatingDebug.componentInstance;
                expect(starRatingComponent.maxRate).toBe(maxRate);
            });
        });

        it('should handle custom labels', () => {
            const mockControl = createMockMetaFormControl(4, { label: 'Customer Satisfaction' });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.label).toBe('Customer Satisfaction');
        });

        it('should handle mid-range rating', () => {
            const mockControl = createMockMetaFormControl(3, { maxRate: 5 });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component.formControl.value).toBe(3);
            const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingFormControlComponent));
            const starRatingComponent = starRatingDebug.componentInstance;
            expect(starRatingComponent.maxRate).toBe(5);
        });
    });
});
