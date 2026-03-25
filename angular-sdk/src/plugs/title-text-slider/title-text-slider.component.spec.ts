import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { TitleTextSliderComponent, ITitleText } from './title-text-slider.component';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    template: `
        <app-title-text-slider [list]="items">
            <ng-template #dataContent let-data="data">
                <div class="content">{{ data.title }} - {{ data.text }}</div>
            </ng-template>
        </app-title-text-slider>
    `,
    standalone: true,
    imports: [TitleTextSliderComponent, CommonModule],
})
class TestHostComponent {
    items: ITitleText[] = [
        { title: 'A', text: 'Alpha' },
        { title: 'B', text: 'Beta' },
        { title: 'C', text: 'Gamma' }
    ];
    @ViewChild(TitleTextSliderComponent) slider!: TitleTextSliderComponent;
}

describe('TitleTextSliderComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: TitleTextSliderComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.slider;
        Object.defineProperty(component.sliderItem.nativeElement, 'offsetWidth', { get: () => 100 });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive list input', () => {
        expect(component.list.length).toBe(3);
    });

    it('should have dataContent defined via ContentChild', () => {
        expect(component.dataContent).toBeTruthy();
    });

    describe('navigation', () => {
        it('should go to next slide', () => {
            component.active_item = 0;
            component.next();
            expect(component.active_item).toBe(1);
            expect(component.slider.nativeElement.style.transform).toBe('translateX(-100px)');
        });

        it('should loop to first slide when next at last slide', () => {
            component.active_item = 2;
            component.next();
            expect(component.active_item).toBe(0);
            expect(component.slider.nativeElement.style.transform).toBe('translateX(0px)');
        });

        it('should go to previous slide', () => {
            component.active_item = 2;
            component.previous();
            expect(component.active_item).toBe(1);
            expect(component.slider.nativeElement.style.transform).toBe('translateX(-100px)');
        });

        it('should loop to last slide when previous at first slide', () => {
            component.active_item = 0;
            component.previous();
            expect(component.active_item).toBe(2);
            expect(component.slider.nativeElement.style.transform).toBe('translateX(-200px)');
        });
    });
});
