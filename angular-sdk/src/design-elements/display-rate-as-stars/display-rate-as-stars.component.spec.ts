import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayRateAsStarsComponent } from './display-rate-as-stars.component';
import { ArrayUtils } from '@algonomia/ts-shared';

describe('DisplayRateAsStarsComponent', () => {
    let component: DisplayRateAsStarsComponent;
    let fixture: ComponentFixture<DisplayRateAsStarsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DisplayRateAsStarsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayRateAsStarsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should have clickable default to true', () => {
            expect(component.clickable).toBe(true);
        });

        it('should accept clickable input', () => {
            fixture.componentRef.setInput('clickable', false);
            expect(component.clickable).toBe(false);
        });

        it('should accept maxRate input', () => {
            fixture.componentRef.setInput('maxRate', 10);
            expect(component.maxRate).toBe(10);
        });

        it('should have maxRate default to 5', () => {
            expect(component.maxRate).toBe(5);
        });

        it('should accept value input', () => {
            fixture.componentRef.setInput('value', 3);
            expect(component.value).toBe(3);
        });

        it('should have value default to 0', () => {
            expect(component.value).toBe(0);
        });

        it('should accept size input', () => {
            fixture.componentRef.setInput('size', 'small');
            expect(component.size).toBe('small');
        });

        it('should have size default to regular', () => {
            expect(component.size).toBe('regular');
        });
    });

    describe('ngOnInit', () => {
        it('should call ArrayUtils.arrRange with 1 and maxRate', () => {
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3, 4, 5]);
            fixture.componentRef.setInput('maxRate', 5);

            component.ngOnInit();

            expect(ArrayUtils.arrRange).toHaveBeenCalledWith(1, 5);
        });

        it('should set __rateArr from ArrayUtils.arrRange', () => {
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3, 4, 5]);
            fixture.componentRef.setInput('maxRate', 5);

            component.ngOnInit();

            expect(component['__rateArr']).toEqual([1, 2, 3, 4, 5]);
        });

        it('should call markForCheck', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3, 4, 5]);

            component.ngOnInit();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should generate correct array for maxRate of 3', () => {
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3]);
            fixture.componentRef.setInput('maxRate', 3);

            component.ngOnInit();

            expect(component['__rateArr']).toEqual([1, 2, 3]);
        });

        it('should generate correct array for maxRate of 10', () => {
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            fixture.componentRef.setInput('maxRate', 10);

            component.ngOnInit();

            expect(component['__rateArr']).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    describe('onClickValue', () => {
        it('should emit clickValue when clickable is true', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('clickable', true);

            component.onClickValue(3);

            expect(component.clickValue.emit).toHaveBeenCalledWith(3);
        });

        it('should not emit clickValue when clickable is false', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('clickable', false);

            component.onClickValue(3);

            expect(component.clickValue.emit).not.toHaveBeenCalled();
        });

        it('should emit correct rate value', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('clickable', true);

            component.onClickValue(5);

            expect(component.clickValue.emit).toHaveBeenCalledWith(5);
        });

        it('should handle multiple clicks when clickable is true', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('clickable', true);

            component.onClickValue(1);
            component.onClickValue(3);
            component.onClickValue(5);

            expect(component.clickValue.emit).toHaveBeenCalledTimes(3);
            expect(component.clickValue.emit).toHaveBeenCalledWith(1);
            expect(component.clickValue.emit).toHaveBeenCalledWith(3);
            expect(component.clickValue.emit).toHaveBeenCalledWith(5);
        });
    });

    describe('Template Rendering', () => {
        beforeEach(() => {
            spyOn(ArrayUtils, 'arrRange').and.returnValue([1, 2, 3, 4, 5]);
        });

        it('should render container when value is greater than 0', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should render container when clickable is true', () => {
            fixture.componentRef.setInput('value', 0);
            fixture.componentRef.setInput('clickable', true);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should not render when value is 0 and clickable is false', () => {
            fixture.componentRef.setInput('value', 0);
            fixture.componentRef.setInput('clickable', false);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeFalsy();
        });

        it('should apply gap-5px class when size is regular', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('size', 'regular');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container.classList.contains('gap-5px')).toBe(true);
        });

        it('should apply gap-2px class when size is small', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('size', 'small');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container.classList.contains('gap-2px')).toBe(true);
        });

        it('should render correct number of stars based on maxRate', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('maxRate', 5);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(5);
        });

        it('should apply cursor-pointer class when clickable is true', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('clickable', true);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            icons.forEach((icon: HTMLElement) => {
                expect(icon.classList.contains('cursor-pointer')).toBe(true);
            });
        });

        it('should not apply cursor-pointer class when clickable is false', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('clickable', false);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            icons.forEach((icon: HTMLElement) => {
                expect(icon.classList.contains('cursor-pointer')).toBe(false);
            });
        });

        it('should apply icon-medium class when size is regular', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('size', 'regular');
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            icons.forEach((icon: HTMLElement) => {
                expect(icon.classList.contains('icon-medium')).toBe(true);
            });
        });

        it('should apply icon-normal class when size is small', () => {
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('size', 'small');
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            icons.forEach((icon: HTMLElement) => {
                expect(icon.classList.contains('icon-normal')).toBe(true);
            });
        });

        it('should trigger onClickValue when star is clicked', () => {
            spyOn(component, 'onClickValue');
            fixture.componentRef.setInput('value', 3);
            fixture.componentRef.setInput('clickable', true);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            icons[2].click();

            expect(component.onClickValue).toHaveBeenCalledWith(3);
        });
    });

    describe('Edge Cases', () => {
        beforeEach(() => {
            spyOn(ArrayUtils, 'arrRange').and.callFake((start: number, end: number) => {
                return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            });
        });

        it('should handle maxRate of 1', () => {
            fixture.componentRef.setInput('maxRate', 1);
            component.ngOnInit();

            expect(component['__rateArr']).toEqual([1]);
        });

        it('should handle maxRate of 10', () => {
            fixture.componentRef.setInput('maxRate', 10);
            component.ngOnInit();

            expect(component['__rateArr'].length).toBe(10);
        });

        it('should handle value equal to maxRate', () => {
            fixture.componentRef.setInput('maxRate', 5);
            fixture.componentRef.setInput('value', 5);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should handle value greater than maxRate', () => {
            fixture.componentRef.setInput('maxRate', 5);
            fixture.componentRef.setInput('value', 10);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should handle negative value', () => {
            fixture.componentRef.setInput('value', -1);
            fixture.componentRef.setInput('clickable', true);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should handle decimal value', () => {
            fixture.componentRef.setInput('value', 3.5);
            fixture.detectChanges();

            expect(component.value).toBe(3.5);
        });

        it('should handle clicking with rate of 0', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('clickable', true);

            component.onClickValue(0);

            expect(component.clickValue.emit).toHaveBeenCalledWith(0);
        });

        it('should handle switching clickable multiple times', () => {
            spyOn(component.clickValue, 'emit');

            fixture.componentRef.setInput('clickable', true);
            component.onClickValue(3);
            expect(component.clickValue.emit).toHaveBeenCalledTimes(1);

            fixture.componentRef.setInput('clickable', false);
            component.onClickValue(3);
            expect(component.clickValue.emit).toHaveBeenCalledTimes(1);

            fixture.componentRef.setInput('clickable', true);
            component.onClickValue(3);
            expect(component.clickValue.emit).toHaveBeenCalledTimes(2);
        });

        it('should handle changing maxRate after ngOnInit', () => {
            fixture.componentRef.setInput('maxRate', 5);
            component.ngOnInit();
            expect(component['__rateArr'].length).toBe(5);

            fixture.componentRef.setInput('maxRate', 3);
            component.ngOnInit();
            expect(component['__rateArr'].length).toBe(3);
        });
    });
});
