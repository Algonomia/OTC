import {firstValueFrom, map, Observable, of, switchMap, tap} from 'rxjs';
import {SelectHandler} from '../../handlers/select-handler/select-handler';
import {TranslateService} from '@ngx-translate/core';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';

export class SelectedTextDelegate {
    static selectedText$<T, ID>(
        selectHandler$: Observable<SelectHandler<T, ID>>,
        placeholder: string,
        translateService: TranslateService
    ): Observable<string> {
        let _selectHandler: SelectHandler<T, ID>;
        return selectHandler$.pipe(
            tap(selectHandler => {
                _selectHandler = selectHandler;
            }),
            switchMap(_ => _selectHandler.list$),
            switchMap(_ => _selectHandler.selected$),
            switchMap(_ => this._getSelectedText$(_selectHandler, placeholder, translateService))
        )
    }

    private static _getSelectedText$<T, ID>(
        selectHandler: SelectHandler<T, ID>,
        placeholder: string,
        translateService: TranslateService
    ) {
        const list = selectHandler.list;
        const selectedList = selectHandler.selected;
        if (selectedList.length === 0) {
            return of(placeholder);
        } else if (selectedList.length === list.length && selectedList.length > 1) {
            return translateService.get('AngularSdk.CoreCommon.All');
        } else {
            return fromPromise(Promise.all(
                selectedList.map((x: T) =>
                    firstValueFrom(selectHandler.displayValue$(x))
                ))
            ).pipe(map(names => {
                if (names.length === 1) {
                    return names[0] ?? '';
                }
                const sorted = names.sort();
                return (sorted[0] ?? '') + ' +' + (sorted.length - 1);
            }));
        }
    }
}
