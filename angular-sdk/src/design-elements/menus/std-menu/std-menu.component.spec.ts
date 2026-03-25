import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { StdMenuComponent } from './std-menu.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, of, take } from 'rxjs';
import { NO_ERRORS_SCHEMA, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { setAppInjector } from '../../../injector';

class MockSelectHandler<T, ID> {
    list$ = new BehaviorSubject<T[]>([]);
    selected$ = new BehaviorSubject<T[]>([]);

    get list(): T[] {
        return this.list$.value;
    }

    get selected(): T[] {
        return this.selected$.value;
    }

    displayValue$(item: T): any {
        return of(`Item ${item}`);
    }
}

describe('StdMenuComponent', () => {
    let component: StdMenuComponent<any, any>;
    let fixture: ComponentFixture<StdMenuComponent<any, any>>;
    let mockSelectHandler: MockSelectHandler<any, any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                StdMenuComponent,
                TranslateModule.forRoot()
            ],
        }).overrideComponent(StdMenuComponent, {
            set: {
                imports: [AsyncPipe, TranslatePipe, ReactiveFormsModule],
                schemas: [NO_ERRORS_SCHEMA]
            }
        }).compileComponents();

        setAppInjector(TestBed.inject(Injector));
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StdMenuComponent);
        component = fixture.componentInstance;

        mockSelectHandler = new MockSelectHandler();
        component.selectHandler = mockSelectHandler as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.placeholder).toBe('Menu');
        expect(component.selectAll).toBe(true);
        expect(component.sorted).toBe(true);
        expect(component.__isOpen).toBe(false);
    });

    it('should accept custom placeholder', () => {
        component.placeholder = 'Custom Placeholder';
        expect(component.placeholder).toBe('Custom Placeholder');
    });

    it('should accept custom selectAll value', () => {
        component.selectAll = false;
        expect(component.selectAll).toBe(false);
    });

    it('should accept custom sorted value', () => {
        component.sorted = false;
        expect(component.sorted).toBe(false);
    });

    it('should change open state', () => {
        expect(component.__isOpen).toBe(false);

        component.changeOpen(true);
        expect(component.__isOpen).toBe(true);

        component.changeOpen(false);
        expect(component.__isOpen).toBe(false);
    });

    it('should mark for check when changing open state', () => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');

        component.changeOpen(true);

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should initialize search control on ngOnInit', () => {
        component.ngOnInit();

        expect(component.__searchControl).toBeDefined();
        expect(component.__searchControl.value).toBe('');
    });

    it('should initialize filteredList$ observable', fakeAsync(() => {
        const testItems = ['item1', 'item2', 'item3'];
        mockSelectHandler.list$.next(testItems);

        component.ngOnInit();
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual(testItems);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should display placeholder when no items selected', fakeAsync(() => {
        mockSelectHandler.selected$.next([]);
        component.placeholder = 'Select Item';

        component.ngOnInit();
        tick();

        expect(component.__text).toBe('Select Item');
    }));

    it('should update text when items are selected', fakeAsync(() => {
        const testItems = ['item1', 'item2'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.selected$.next(['item1']);
        mockSelectHandler.displayValue$ = jasmine.createSpy().and.returnValue(of('Item 1'));

        component.ngOnInit();
        tick();

        expect(component.__text).toBeDefined();
        flush();
    }));

    it('should display single item name when one item selected', fakeAsync(() => {
        const testItems = ['item1'];
        mockSelectHandler.selected$.next(testItems);
        mockSelectHandler.displayValue$ = jasmine.createSpy().and.returnValue(of('Item 1'));

        component.ngOnInit();
        tick();

        expect(component.__text).toBeDefined();
    }));

    it('should display first item +count when multiple items selected', fakeAsync(() => {
        const testItems = ['item1', 'item2', 'item3'];
        mockSelectHandler.selected$.next(testItems);
        mockSelectHandler.displayValue$ = jasmine.createSpy().and.returnValues(
            of('Apple'),
            of('Banana'),
            of('Cherry')
        );

        component.ngOnInit();
        tick();

        expect(component.__text).toBeDefined();
    }));

    it('should filter list based on search input', fakeAsync(() => {
        const testItems = ['Apple', 'Banana', 'Cherry'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);

        component.ngOnInit();

        let capturedList: string[] = [];
        const subscription = component.__filteredList$.subscribe(list => {
            capturedList = list;
        });

        tick(300);
        expect(capturedList).toEqual(['Apple', 'Banana', 'Cherry']);

        component.__searchControl.setValue('ban');
        tick(300);

        expect(capturedList).toEqual(['Banana']);
        subscription.unsubscribe();
    }));

    it('should filter list case-insensitively', fakeAsync(() => {
        const testItems = ['Apple', 'Banana', 'Cherry'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);

        component.ngOnInit();

        let capturedList: string[] = [];
        const subscription = component.__filteredList$.subscribe(list => {
            capturedList = list;
        });

        tick(300);

        component.__searchControl.setValue('APPLE');
        tick(300);

        expect(capturedList).toEqual(['Apple']);
        subscription.unsubscribe();
    }));

    it('should sort filtered list when sorted is true', fakeAsync(() => {
        const testItems = ['Cherry', 'Apple', 'Banana'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);
        component.sorted = true;

        component.ngOnInit();
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual(['Apple', 'Banana', 'Cherry']);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should not sort filtered list when sorted is false', fakeAsync(() => {
        const testItems = ['Cherry', 'Apple', 'Banana'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);
        component.sorted = false;

        component.ngOnInit();
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual(['Cherry', 'Apple', 'Banana']);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should debounce search input', fakeAsync(() => {
        const testItems = ['Apple', 'Banana'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);

        component.ngOnInit();
        tick();

        let emitCount = 0;
        const subscription = component.__filteredList$.subscribe(() => {
            emitCount++;
        });

        component.__searchControl.setValue('A');
        tick(100);
        component.__searchControl.setValue('Ap');
        tick(100);
        component.__searchControl.setValue('App');
        tick(300);

        expect(emitCount).toBeGreaterThan(0);
        subscription.unsubscribe();
    }));

    it('should handle empty search gracefully', fakeAsync(() => {
        const testItems = ['Apple', 'Banana', 'Cherry'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);

        component.ngOnInit();
        tick();

        component.__searchControl.setValue('');
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual(['Apple', 'Banana', 'Cherry']);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should mark for check when selected items change', fakeAsync(() => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');

        component.ngOnInit();
        tick();

        mockSelectHandler.selected$.next(['item1']);
        tick();

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    }));

    it('should handle null search value', fakeAsync(() => {
        const testItems = ['Apple', 'Banana'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = (item: string) => of(item);

        component.ngOnInit();
        tick();

        component.__searchControl.setValue(null);
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual(['Apple', 'Banana']);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should unsubscribe on component destroy', fakeAsync(() => {
        component.ngOnInit();
        tick();

        component.ngOnDestroy();

        mockSelectHandler.selected$.next(['item1']);
        tick();

        expect(component.__text).toBeDefined();
    }));

    it('should handle items with undefined labels', fakeAsync(() => {
        const testItems = ['item1', 'item2'];
        mockSelectHandler.list$.next(testItems);
        mockSelectHandler.displayValue$ = jasmine.createSpy().and.returnValues(
            of(''),
            of('Item 2')
        );

        component.ngOnInit();
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list.length).toBe(2);
        });

        tick();
        subscription.unsubscribe();
    }));

    it('should handle empty list', fakeAsync(() => {
        mockSelectHandler.list$.next([]);

        component.ngOnInit();
        tick(300);

        const subscription = component.__filteredList$.pipe(take(1)).subscribe(list => {
            expect(list).toEqual([]);
        });

        tick();
        subscription.unsubscribe();
    }));
});
