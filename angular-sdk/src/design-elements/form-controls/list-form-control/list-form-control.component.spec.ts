import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListFormControlComponent } from './list-form-control.component';
import { FormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

class MockSelectHandler<T> {
    selected$ = new BehaviorSubject<T[]>([]);
    displayValue$ = jasmine.createSpy('displayValue$').and.returnValue('');
    replaceAll = jasmine.createSpy('replaceAll');
    allSelectedStrict = jasmine.createSpy('allSelectedStrict').and.returnValue(false);
}

describe('ListFormControlComponent', () => {
    let component: ListFormControlComponent<string, string>;
    let fixture: ComponentFixture<ListFormControlComponent<string, string>>;
    let formControl: FormControl<string | string[] | null>;
    let selectHandler: MockSelectHandler<string>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ListFormControlComponent,
                TranslateModule.forRoot()
            ]
        }).overrideComponent(ListFormControlComponent, {
            set: {
                imports: [TranslatePipe],
                schemas: [NO_ERRORS_SCHEMA]
            }
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListFormControlComponent<string, string>);
        component = fixture.componentInstance;

        formControl = new FormControl<string | string[] | null>(null);
        selectHandler = new MockSelectHandler<string>();

        component.formControl = formControl;
        component.selectHandler = selectHandler as any;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update formControl when selectHandler emits (single)', () => {
        selectHandler.selected$.next(['A']);

        expect(formControl.value).toBe('A');
        expect(formControl.touched).toBeTrue();
    });

    it('should update formControl with array when multiple=true', () => {
        fixture.componentRef.setInput('multiple', true);
        selectHandler.selected$.next(['A', 'B']);

        expect(formControl.value).toEqual(['A', 'B']);
    });

    it('should set null when multiple=true and emptySelectionIsNull', () => {
        fixture.componentRef.setInput('multiple', true);
        fixture.componentRef.setInput('emptySelectionIsNull', true);
        selectHandler.selected$.next([]);

        expect(formControl.value).toBeNull();
    });

    it('should update selectHandler when formControl value changes', () => {
        formControl.setValue('A');
        expect(selectHandler.replaceAll).toHaveBeenCalledWith(['A']);
    });

    it('should update selectHandler with array when multiple=true', () => {
        fixture.componentRef.setInput('multiple', true);
        formControl.setValue(['A', 'B']);

        expect(selectHandler.replaceAll).toHaveBeenCalledWith(['A', 'B']);
    });

    it('should ignore null and undefined values when syncing', () => {
        fixture.componentRef.setInput('multiple', true);
        formControl.setValue([null as any, 'A', undefined as any]);

        expect(selectHandler.replaceAll).toHaveBeenCalledWith(['A']);
    });

    it('should not update formControl if already aligned', () => {
        selectHandler.allSelectedStrict.and.returnValue(true);
        const spy = spyOn(formControl, 'setValue');
        selectHandler.selected$.next(['A']);

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not update selectHandler if already aligned', () => {
        selectHandler.allSelectedStrict.and.returnValue(true);
        formControl.setValue('A');
        expect(selectHandler.replaceAll).not.toHaveBeenCalled();
    });

    it('should mark for check when selection changes', () => {
        const spy = spyOn(component['_cd'], 'markForCheck');
        selectHandler.selected$.next(['A']);
        expect(spy).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        component.ngOnDestroy();
        selectHandler.selected$.next(['A']);
        formControl.setValue('B');

        expect(selectHandler.replaceAll).not.toHaveBeenCalled();
    });
});
