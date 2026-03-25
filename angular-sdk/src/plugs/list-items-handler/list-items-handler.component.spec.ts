import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { ListItemsHandlerComponent } from './list-items-handler.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    template: `
        <app-list-items-handler [list]="testList">
            <ng-template #dataContent let-data="data">
                <span class="test-item">{{ data }}</span>
            </ng-template>
            <ng-template #counterTemplate let-counter="counter">
                <span class="test-counter">+{{ counter }}</span>
            </ng-template>
        </app-list-items-handler>
    `,
    standalone: true,
    imports: [ListItemsHandlerComponent]
})
class TestHostComponent {
    @ViewChild(ListItemsHandlerComponent) listItemsHandler!: ListItemsHandlerComponent<string>;
    testList: string[] = [];
}

describe('ListItemsHandlerComponent', () => {
    let hostComponent: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let component: ListItemsHandlerComponent<string>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        fixture.detectChanges();
        component = hostComponent.listItemsHandler;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        describe('list setter', () => {
            it('should accept list input', () => {
                const testData = ['item1', 'item2', 'item3'];
                hostComponent.testList = testData;
                fixture.detectChanges();

                expect(component['__full_list']).toEqual(testData);
            });

            it('should create a copy of the input array', () => {
                const testData = ['item1', 'item2'];
                hostComponent.testList = testData;
                fixture.detectChanges();

                expect(component['__full_list']).not.toBe(testData);
                expect(component['__full_list']).toEqual(testData);
            });

            it('should call markForCheck when list is set', () => {
                const cdSpy = spyOn(component['_cd'], 'markForCheck');
                hostComponent.testList = ['item1'];
                fixture.detectChanges();

                expect(cdSpy).toHaveBeenCalled();
            });
        });
    });

    describe('Template Rendering', () => {
        it('should render list-items-handler container', () => {
            const container = fixture.nativeElement.querySelector('.list-items-handler');
            expect(container).toBeTruthy();
        });
    });
});