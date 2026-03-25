import {BehaviorSubject, Observable, of, Subject, switchMap} from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export enum SelectionState {EMPTY, PARTIAL, ALL}
export enum ESelectionMode {
    none = 'none',
    single = 'single',
    multiple = 'multiple',
}

export class SelectHandler<T, ID> {
    static getMultiSelectHandler<T, ID>(list: T[], locked: T[] = [], preselected: T[] = [], trackBy?: (x: T) => ID, viewValue?: (x: T) => string | Observable<string>) {
        return new SelectHandler<T, ID>(list, locked, preselected, trackBy, viewValue, undefined, undefined);
    }

    static getMonoSelectHandler<T, ID>(list: T[], locked: T[] = [], preselected: T[] = [], trackBy?: (x: T) => ID, viewValue?: (x: T) => string | Observable<string>) {
        return new SelectHandler<T, ID>(list, locked, preselected, trackBy, viewValue, 0, 1);
    }

    static getAlwaysOneSelectHandler<T, ID>(list: T[], locked: T[] = [], preselected: T[] = [], trackBy?: (x: T) => ID, viewValue?: (x: T) => string | Observable<string>) {
        return new SelectHandler<T, ID>(list, locked, preselected, trackBy, viewValue, 1, 1);
    }

    static getAtLeastOneSelectHandler<T, ID>(list: T[], locked: T[] = [], preselected: T[] = [], trackBy?: (x: T) => ID, viewValue?: (x: T) => string | Observable<string>) {
        return new SelectHandler<T, ID>(list, locked, preselected, trackBy, viewValue, 1, undefined);
    }

    // Selection is not possible with below. Useful to rapidly encapsulate components which may take arrays or selectHandlers
    static getFakeSelectHandlerForEncapsulation<T, ID = T>(list: T[], trackBy?: (x: T) => ID, viewValue?: (x: T) => string) {
        return new SelectHandler<T, ID>(list, [], [], trackBy, viewValue, 0, 0);
    }

    private _list$ = new BehaviorSubject<T[]>([]);
    private _listIds$ = new BehaviorSubject<Set<ID>>(new Set());

    private _locked$ = new BehaviorSubject<T[]>([]);
    private _lockedIds$ = new BehaviorSubject<Set<ID>>(new Set());

    private _selectedIds$ = new BehaviorSubject<Set<ID>>(new Set());
    private _selected$ = new BehaviorSubject<T[]>([]);
    private _remaining$ = new BehaviorSubject<T[]>([]);
    private _selectionAttempt$ = new Subject<T[]>();

    private _selectionState$ = new BehaviorSubject<SelectionState>(SelectionState.EMPTY);

    private readonly _trackBy: (x: T) => ID;
    private readonly _viewValue?: (x: T) => string | Observable<string>;
    private readonly _minSelected?: number;
    private readonly _maxSelected?: number;

    private constructor(
        list: T[],
        locked: T[] = [],
        preselected: T[] = [],
        trackBy: (x: T) => ID = ((x: T) => x as unknown as ID),
        viewValue?: (x: T) => string | Observable<string>,
        minSelected?: number,
        maxSelected?: number
    ) {
        this._trackBy = trackBy;
        this._viewValue = viewValue;
        this._minSelected = minSelected;
        this._maxSelected = maxSelected;
        this.changeList(list, preselected, locked);
    }

    // --- PUBLIC API ---

    displayValue$(value: T) {
        const displayVal = this.displayValue(value);
        if (displayVal instanceof Observable) {
            return displayVal;
        }
        return of(displayVal);
    }

    get firstSelectedDisplayValue$() {
        return this.firstSelected$.pipe(switchMap(x => {
            if (x === undefined) {
                return of('');
            }
            return this.displayValue$(x)
        }));
    }

    displayValue(value: T) {
        return this._viewValue ? this._viewValue(value) : value?.toString();
    }

    changeList(list: T[], selected?: T[], locked?: T[]) {
        this._nextList$(list);
        if (locked !== undefined) {
            this._nextLocked$(locked);
        } else {
            this._nextLocked$(this._locked$.getValue());
        }
        if (selected !== undefined) {
            this.replaceAll(selected);
        } else {
            this._updateSelection(this._selectedIds$.getValue());
        }
    }

    changeLocked(locked: T[]) {
        const filteredLocked = this._nextLocked$(locked);
        this.add(filteredLocked);
    }

    switch(value: T) {
        const id = this._trackBy(value);
        const current = new Set(this._selectedIds$.getValue());
        current.has(id) ? current.delete(id) : current.add(id);
        this._updateSelection(current);
    }

    switchSome(values: T[]) {
        const state = this._selectionState$.getValue();
        if (state === SelectionState.PARTIAL || state === SelectionState.ALL) {
            this.removeAll();
        } else {
            this.add(values);
        }
    }

    switchAll() {
        const state = this._selectionState$.getValue();
        state === SelectionState.ALL || state === SelectionState.PARTIAL
            ? this.removeAll()
            : this.addAll();
    }

    add(values: T | T[]) {
        const ids = this._toIds(values);
        this.addIds(ids);
    }

    addIds(ids: ID[]) {
        const current = new Set(this._selectedIds$.getValue());
        ids.forEach(id => current.add(id));
        this._updateSelection(current);
    }

    remove(values: T | T[]) {
        const ids = this._toIds(values);
        const current = new Set(this._selectedIds$.getValue());
        ids.forEach(id => current.delete(id));
        this._updateSelection(current);
    }

    removeAll() {
        this._updateSelection(new Set());
    }

    addAll() {
        this._updateSelection(new Set(this._listIds$.getValue()));
    }

    replaceAll(values: T[]) {
        const ids = new Set(values.map(this._trackBy));
        this._updateSelection(ids);
    }

    replaceSome(oldValues: T[], newValues: T[]) {
        const current = new Set(this._selectedIds$.getValue());
        this._toIds(oldValues).forEach(id => current.delete(id));
        this._toIds(newValues).forEach(id => current.add(id));
        this._updateSelection(current);
    }

    // --- PRIVATE FUNCTIONS ---

    private _nextList$(list: T[]) {
        this._list$.next(list);
        this._listIds$.next(new Set(list.map(this._trackBy)));
    }

    private _nextLocked$(locked: T[]) {
        const listIds = new Set(this._listIds$.getValue());
        const filtered = locked.filter((x) => listIds.has(this._trackBy(x)));
        this._locked$.next(filtered);
        this._lockedIds$.next(new Set(filtered.map(x => this._trackBy(x))));
        return filtered;
    }

    private _toIds(values: T | T[]): ID[] {
        if (Array.isArray(values)) {
            return values.map(this._trackBy);
        }
        return [this._trackBy(values)];
    }

    private _updateSelection(ids: Set<ID>) {
        const selectionAttemptItems = this._getItemsFromIds(ids);
        this._selectionAttempt$.next(selectionAttemptItems);

        let idSelection = this._mergeWithLocked(ids);
        idSelection = this._removeOldestElements(idSelection);
        idSelection = this._fillWithPreviousSelection(idSelection);
        idSelection = this._fillWithListElements(idSelection);
        if (!this._checkSelectionChange(idSelection)) {
            return;
        }
        const idSelectionSet = new Set(idSelection);
        const [selected, remaining] = this._getSelectedRemainingArrs(idSelectionSet);
        const selectionState = this._calculateSelectionState(idSelectionSet);

        this._selectedIds$.next(idSelectionSet);
        this._selected$.next(selected);
        this._remaining$.next(remaining);
        this._selectionState$.next(selectionState);
    }

    private _mergeWithLocked(ids: Set<ID>) {
        const listIds = this._listIds$.getValue();
        const lockedIds = this._lockedIds$.getValue();

        const merged = [...new Set([...ids, ...lockedIds])];
        return merged.filter(id => listIds.has(id));
    }

    private _removeOldestElements(idSelection: ID[]) {
        const max = this._maxSelected;
        if (max === undefined || idSelection.length <= max) {
            return idSelection;
        }
        if (max === 0) {
            return [];
        }
        return idSelection.slice(-max);
    }

    private _fillWithPreviousSelection(idSelection: ID[]) {
        const min = this._minSelected;
        if (min === undefined || idSelection.length >= min) {
            return idSelection;
        }
        const needed = min - idSelection.length;
        const previous = Array.from(this._selectedIds$.getValue()).filter(x => this._listIds$.getValue().has(x));
        const idSelectionSet = new Set(idSelection);

        const candidatesFromOld = previous.filter(id => !idSelectionSet.has(id))
                                                .slice(-needed);
        return [...candidatesFromOld, ...idSelection];
    }

    private _fillWithListElements(idSelection: ID[]) {
        const min = this._minSelected;
        if (min === undefined || idSelection.length >= min) {
            return idSelection;
        }
        const listIds = this._listIds$.getValue();
        const needed = min - idSelection.length;
        let idSelectionSet = new Set(idSelection);
        const listIdsToAdd = [...listIds].filter(id => !idSelectionSet.has(id));
        const candidatesFromList = listIdsToAdd.slice(0, needed);
        return [...idSelection, ...candidatesFromList];
    }

    private _checkSelectionChange(idSelection: ID[]) {
        const current = this._selectedIds$.getValue();
        return idSelection.length !== current.size ||
               idSelection.some(id => !current.has(id));
    }

    private _getItemsFromIds(idSet: Set<ID>): T[] {
        const list = this._list$.getValue();
        return list.filter(item => {
            const id = this._trackBy(item);
            return idSet.has(id);
        });
    }

    private _getSelectedRemainingArrs(idSelectionSet: Set<ID>): [T[], T[]] {
        const list = this._list$.getValue();
        const selected: T[] = [];
        const remaining: T[] = [];

        for (const item of list) {
            const id = this._trackBy(item);
            (idSelectionSet.has(id) ? selected : remaining).push(item);
        }
        return [selected, remaining];
    }

    private _calculateSelectionState(ids: Set<ID>): SelectionState {
        const total = this._listIds$.getValue().size;
        const selected = ids.size;

        if (total === 0 || selected === 0) return SelectionState.EMPTY;
        if (selected === total) return SelectionState.ALL;
        return SelectionState.PARTIAL;
    }

    // --- PUBLIC STREAMS ---

    get selected$(): Observable<T[]> {
        return this._selected$.asObservable();
    }

    get remaining$(): Observable<T[]> {
        return this._remaining$.asObservable();
    }

    get locked$(): Observable<T[]> {
        return this._locked$.asObservable();
    }

    get list$(): Observable<T[]> {
        return this._list$.asObservable();
    }

    get selectedState$(): Observable<SelectionState> {
        return this._selectionState$.asObservable().pipe(distinctUntilChanged());
    }

    get selectionAttempt$() {
        return this._selectionAttempt$.asObservable();
    }

    get firstSelected$(): Observable<T | undefined> {
        return this._selected$.pipe(
            map(list => list.at(0)),
            distinctUntilChanged()
        );
    }

    isSelected$(item: T): Observable<boolean> {
        const id = this._trackBy(item);
        return this._selectedIds$.pipe(
            map(set => set.has(id)),
            distinctUntilChanged()
        );
    }

    someSelected$(items: T[]): Observable<boolean> {
        const ids = this._toIds(items);
        return this._selectedIds$.pipe(
            map(set => ids.some(id => set.has(id))),
            distinctUntilChanged()
        );
    }

    allSelected$(items: T[]): Observable<boolean> {
        const ids = this._toIds(items);
        return this._selectedIds$.pipe(
            map(set => ids.every(id => set.has(id))),
            distinctUntilChanged()
        );
    }

    isLocked$(item: T): Observable<boolean> {
        const id = this._trackBy(item);
        return this._lockedIds$.pipe(
            map(set => set.has(id)),
            distinctUntilChanged()
        );
    }

    get selected(): T[] {
        return [...this._selected$.getValue()];
    }

    get list(): T[] {
        return [...this._list$.getValue()];
    }

    isSelected(item: T): boolean {
        return this._selectedIds$.getValue().has(this._trackBy(item));
    }

    allSelectedStrict(items: T[]): boolean {
        return this._selectedIds$.getValue().size === items.length && this.allSelected(items);
    }

    allSelected(items: T[]): boolean {
        return items.every(item => this._selectedIds$.getValue().has(this._trackBy(item)));
    }

    isLocked(item: T): boolean {
        return this._lockedIds$.getValue().has(this._trackBy(item));
    }

    get selectedState(): SelectionState {
        return this._selectionState$.getValue();
    }

    get selectedSize() {
        return this._selected$.getValue().length;
    }

    get isSingleSelection() {
        return this._maxSelected === 1;
    }

    get isMultiSelection() {
        return (this._maxSelected ?? Infinity) > 1;
    }

    get isFakeSelectHandler() {
        return this._maxSelected === 0;
    }

    get selectionMode(): ESelectionMode {
        if (this._maxSelected === 0) {
            return ESelectionMode.none;
        } else if (this._maxSelected === 1) {
            return ESelectionMode.single;
        } else {
            return ESelectionMode.multiple;
        }
    }
}
