import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SingleSelectBoxComponent} from './single-select-box.component';
import {TranslateModule} from '@ngx-translate/core';
import {ESelectionMode, SelectHandler} from '../../../handlers/select-handler/select-handler';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';

interface TestItem {
    id: number;
    name: string;
}

describe('SingleSelectBoxComponent', () => {
    let component: SingleSelectBoxComponent<TestItem, number>;
    let fixture: ComponentFixture<SingleSelectBoxComponent<TestItem, number>>;
    let mockSelectHandlerSingle: Partial<SelectHandler<TestItem, number>>;
    let mockSelectHandlerMultiple: Partial<SelectHandler<TestItem, number>>;
    let selectedSubject: BehaviorSubject<TestItem[]>;

    function createMockSelectHandler(mode: ESelectionMode): Partial<SelectHandler<TestItem, number>> {
        return {
            selectionMode: mode,
            selected$: selectedSubject.asObservable(),
            switch: jasmine.createSpy('switch'),
            isSelected$: (item: TestItem) => {
                return selectedSubject.pipe(
                    map(selected => selected.some(s => s.id === item.id))
                );
            }
        };
    }

    beforeEach(async () => {
        selectedSubject = new BehaviorSubject<TestItem[]>([]);
        mockSelectHandlerSingle = createMockSelectHandler(ESelectionMode.single);
        mockSelectHandlerMultiple = createMockSelectHandler(ESelectionMode.multiple);

        await TestBed.configureTestingModule({
            imports: [SingleSelectBoxComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleSelectBoxComponent<TestItem, number>);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have default disabled of false', () => {
            expect(component.disabled).toBe(false);
        });

        it('should have default colorTheme of dark', () => {
            expect(component.colorTheme).toBe('dark');
        });
    });

    describe('onClick method', () => {
        let mockEvent: Event;

        beforeEach(() => {
            mockEvent = new Event('click');
            spyOn(mockEvent, 'stopPropagation');
        });

        it('should call selectHandler.switch and stop propagation when clicked with valid item', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', testItem);

            component.onClick(mockEvent);

            expect(mockSelectHandlerSingle.switch).toHaveBeenCalledWith(testItem);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should not call selectHandler.switch when disabled', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', testItem);
            fixture.componentRef.setInput('disabled', true);

            component.onClick(mockEvent);

            expect(mockSelectHandlerSingle.switch).not.toHaveBeenCalled();
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        });

        it('should not call selectHandler.switch when item is undefined', () => {
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', undefined);

            component.onClick(mockEvent);

            expect(mockSelectHandlerSingle.switch).not.toHaveBeenCalled();
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        });

        it('should not throw error when selectHandler is null', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', null);
            fixture.componentRef.setInput('item', testItem);

            expect(() => component.onClick(mockEvent)).not.toThrow();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('Conditional Rendering', () => {
        it('should not render when selectHandler is undefined', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            expect(container).toBeNull();
        });

        it('should not render when item is undefined', () => {
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            expect(container).toBeNull();
        });

        it('should render when both selectHandler and item are provided', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            expect(container).toBeTruthy();
        });

        it('should not render when selectHandler is null', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', null);
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            expect(container).toBeNull();
        });
    });

    describe('Selection Mode Behavior', () => {
        it('should render icon for single selection mode', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeTruthy();
        });

        it('should render icon for multiple selection mode', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerMultiple);
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('app-algo-icon');
            expect(icon).toBeTruthy();
        });
    });

    describe('Selection State Changes', () => {
        it('should react to selection state changes', () => {
            const testItem: TestItem = { id: 1, name: 'Test' };
            selectedSubject.next([]);
            fixture.componentRef.setInput('selectHandler', mockSelectHandlerSingle);
            fixture.componentRef.setInput('item', testItem);
            fixture.detectChanges();

            const iconBefore = fixture.nativeElement.querySelector('app-algo-icon');
            expect(iconBefore).toBeTruthy();

            selectedSubject.next([testItem]);
            fixture.detectChanges();

            const iconAfter = fixture.nativeElement.querySelector('app-algo-icon');
            expect(iconAfter).toBeTruthy();
        });
    });
});
