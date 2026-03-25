import { SelectHandler } from '../select-handler/select-handler';
import {
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    firstValueFrom,
    from,
    map,
    Observable, of, shareReplay,
    startWith,
    switchMap, tap
} from 'rxjs';

export class SearchFilterHandler {
    static filteredList$<T, ID>(
        selectHandler$: Observable<SelectHandler<T, ID>>,
        searchControl$: Observable<string | null>,
        sorted: boolean = true,
        showOnlySelected$: Observable<boolean> = of(false)
    ): Observable<T[]> {
        const enhancedSearchControl$ = this._enhancedSearchControl$(searchControl$);
        const valuesAsText$ = this._getValuesAsText$(selectHandler$, showOnlySelected$);

        let _search: string;
        return enhancedSearchControl$.pipe(
            tap(search => _search = search),
            switchMap(_ => valuesAsText$),
            map(displayItems => this._filter(_search, displayItems, sorted))
        );
    }

    private static _enhancedSearchControl$(searchControl$: Observable<string | null>) {
        return searchControl$.pipe(
            debounceTime(300),
            shareReplay({ bufferSize: 1, refCount: false }),
            startWith(null),
            distinctUntilChanged(),
            map(search => (search ?? '').toLowerCase())
        );
    }

    private static _getValuesAsText$<T, ID>(
        selectHandler$: Observable<SelectHandler<T, ID>>,
        showOnlySelected$: Observable<boolean>
    ) {
        let _selectHandler: SelectHandler<T, ID>;
        return selectHandler$.pipe(
            tap(selectHandler => _selectHandler = selectHandler),
            switchMap(_ => showOnlySelected$),
            switchMap(showOnlySelected => showOnlySelected ? _selectHandler.selected$ : _selectHandler.list$),
            switchMap(list => this._displayValues$(_selectHandler, list))
        );
    }

    private static _displayValues$<T, ID>(selectHandler: SelectHandler<T, ID>, list: T[]): Observable<{item: T, label?: string}[]> {
        const promises = list.map(async (item: T) => {
            const label = await firstValueFrom(selectHandler.displayValue$(item));
            return { item, label: label?.toLowerCase() };
        });
        return from(Promise.all(promises));
    }

    private static _filter<T>(search: string, displayItems: {item: T, label?: string}[], sorted: boolean) {
        const filtered = displayItems.filter(({ label }) =>
            label?.includes(search)
        );
        const sortedEntries = sorted
            ? filtered.sort((a, b) => (a.label || '').localeCompare(b.label || ''))
            : filtered;

        return sortedEntries.map(({ item }) => item);
    }
}
