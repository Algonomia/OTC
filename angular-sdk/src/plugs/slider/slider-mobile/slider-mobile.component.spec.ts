import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderMobileComponent } from './slider-mobile.component';
import {Component, ViewChild} from '@angular/core';

@Component({
    template: `
        <app-slider-mobile [list]="items">
            <ng-template #dataContent let-data="data">
                <div class="content">{{ data }}</div>
            </ng-template>
        </app-slider-mobile>
    `,
    standalone: true,
    imports: [SliderMobileComponent],
})
class TestHostComponent {
    items = ['A', 'B', 'C'];
    @ViewChild(SliderMobileComponent) sliderMobile!: SliderMobileComponent;
}

describe('SliderMobileComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: SliderMobileComponent;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SliderMobileComponent, TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.sliderMobile;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive list input', () => {
        expect(component.list).toEqual(['A', 'B', 'C']);
    });

    it('should have dataContent defined via ContentChild', () => {
        expect(component.dataContent).toBeTruthy();
    });

    it('should total slide equal to list length', () => {
        component['_total_slides'] = component.list.length;
        expect(component['_total_slides']).toEqual(3);
    });

    it('should clamp index to valid range', () => {
        component['_total_slides'] = component.list.length;
        component.goToSlide(-1);
        expect(component['_current_index']).toBe(0);
        component.goToSlide(3);
        expect(component['_current_index']).toBe(2);
    });

    it('should start drag', () => {
        component.onTouchStart(new MouseEvent('mousedown', { clientX: 50 }));
        expect(component['_is_dragging']).toBeTrue();
    });

    describe('slide', () => {
        it('should handle onTouchEnd for small drag (no slide change)', () => {
            component['_slide_width'] = 100;
            component['_percentage_to_threshold'] = 0.3;
            component['_total_slides'] = 3;
            component['_before_drag_translate'] = 50;
            component['_on_drag_translate'] = 45;
            component['_current_index'] = 1;
            component['_is_dragging'] = true;
            component['_setTranslateX'] = jasmine.createSpy('_setTranslateX');

            component.onTouchEnd();

            expect(component['_current_index']).toBe(1);
            expect(component['_on_drag_translate']).toBe(0);
            expect(component['_setTranslateX']).toHaveBeenCalledWith(component['_before_drag_translate']);
        });

        it('should increment current_index on swipe left', () => {
            component['_slide_width'] = 100;
            component['_percentage_to_threshold'] = 0.3;
            component['_total_slides'] = 3;
            component['_before_drag_translate'] = 0;
            component['_on_drag_translate'] = 50;
            component['_current_index'] = 0;
            component['_is_dragging'] = true;
            component['_setTranslateX'] = jasmine.createSpy('_setTranslateX');

            component.onTouchEnd();

            expect(component['_current_index']).toBe(1);
        });

        it('should decrement current_index on swipe right', () => {
            component['_before_drag_translate'] = 50;
            component['_on_drag_translate'] = 0;
            component['_is_dragging'] = true;
            component['_slide_width'] = 100;
            component['_percentage_to_threshold'] = 0.3;
            component['_total_slides'] = 3;
            component['_current_index'] = 1;
            component['_setTranslateX'] = jasmine.createSpy('_setTranslateX');

            component.onTouchEnd();

            expect(component['_current_index']).toBe(0);
        });

        it('should not go below slide 0 when swiping right at first slide', () => {
            component['_total_slides'] = component.list.length;
            component['_current_index'] = 0;

            component.onTouchStart(new MouseEvent('mousedown', { clientX: 100 }));
            component.onTouchMove(new MouseEvent('mousemove', { clientX: 160 }));
            component.onTouchEnd();

            expect(component['_current_index']).toBe(0);
        });
    });
});
