import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectAllCheckboxComponent } from './select-all-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { SelectHandler, SelectionState } from '../../../handlers/select-handler/select-handler';
import { BehaviorSubject } from 'rxjs';

interface TestItem {
    id: number;
    name: string;
}

describe('SelectAllCheckboxComponent', () => {
    let component: SelectAllCheckboxComponent<TestItem, number>;
    let fixture: ComponentFixture<SelectAllCheckboxComponent<TestItem, number>>;
    let mockSelectHandler: Partial<SelectHandler<TestItem, number>>;
    let selectionStateSubject: BehaviorSubject<SelectionState>;

    beforeEach(async () => {
        selectionStateSubject = new BehaviorSubject<SelectionState>(SelectionState.EMPTY);

        mockSelectHandler = {
            selectedState$: selectionStateSubject.asObservable(),
            switchAll: jasmine.createSpy('switchAll')
        };

        await TestBed.configureTestingModule({
            imports: [SelectAllCheckboxComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectAllCheckboxComponent<TestItem, number>);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Click Handler', () => {
        it('should call switchAll when container is clicked and not disabled', () => {
            fixture.componentRef.setInput('selectHandler', mockSelectHandler);
            fixture.componentRef.setInput('disabled', false);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            container.click();

            expect(mockSelectHandler.switchAll).toHaveBeenCalled();
        });

        it('should not call switchAll when container is clicked and disabled', () => {
            fixture.componentRef.setInput('selectHandler', mockSelectHandler);
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            container.click();

            expect(mockSelectHandler.switchAll).not.toHaveBeenCalled();
        });

        it('should stop event propagation on click', () => {
            fixture.componentRef.setInput('selectHandler', mockSelectHandler);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('div');
            const clickEvent = new MouseEvent('click', { bubbles: true });
            spyOn(clickEvent, 'stopPropagation');

            container.dispatchEvent(clickEvent);

            expect(clickEvent.stopPropagation).toHaveBeenCalled();
        });
    });
});
