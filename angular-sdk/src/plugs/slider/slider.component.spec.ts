import {Component, ElementRef, QueryList, ViewChild,} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SliderComponent} from './slider.component';
import {Subject} from 'rxjs';

@Component({
    template: `
        <app-slider [list]="items">
            <ng-template #contentTemplate let-item="item">
                <div class="content-item">{{ item }}</div>
            </ng-template>
        </app-slider>
    `,
    standalone: true,
    imports: [SliderComponent],
})
class TestHostComponent {
    items = ['A', 'B', 'C'];
    @ViewChild(SliderComponent) slider!: SliderComponent;
}

describe('SliderComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: SliderComponent;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.slider;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input: list', () => {
        it('should receive list input', () => {
            expect(component.list).toEqual(['A', 'B', 'C']);
        });

        it('should call the setter and store the new list', () => {
            const newList = ['X', 'Y', 'Z'];
            component.list = newList;
            expect(component.list).toEqual(newList);
        });

        it('should update list input when host changes items', () => {
            host.items = ['X', 'Y'];
            fixture.detectChanges();
            expect(component.list).toEqual(['X', 'Y']);
        });
    });

    it('should have contentTemplate defined via ContentChild', () => {
        expect(component.contentTemplate).toBeTruthy();
    });

    describe('ViewChildren: max_height updates', () => {
        it('should update max_height after ViewChildren changes', () => {
            const fake1 = { nativeElement: { offsetHeight: 100 }} as ElementRef;
            const changes$ = new Subject<void>();

            component.itemElements = {
                length: 2,
                first: fake1,
                changes: changes$.asObservable(),
            } as unknown as QueryList<ElementRef>;

            const spy = spyOn(component['_cdr'], 'markForCheck');

            component.ngAfterViewInit();
            changes$.next();

            expect(component.max_height).toBe(100);
            expect(spy).toHaveBeenCalled();
        });

        it('should not update max_height when height is same', () => {
            const fake = { nativeElement: { offsetHeight: 120 } } as ElementRef;
            const ql = new QueryList<ElementRef>();
            ql.reset([fake]);

            component.itemElements = ql;
            component.max_height = 120;

            const privateCdr = (component as unknown as Record<string, any>)['_cdr'];
            const spy = spyOn(privateCdr, 'markForCheck');

            ql.notifyOnChanges();

            expect(component.max_height).toBe(120);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
