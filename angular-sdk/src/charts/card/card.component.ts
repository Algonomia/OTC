import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef} from '@angular/core';
import {AlgoTableColumns} from '../algo-table/columns.interface';
import {ReplaySubject, startWith, switchMap, tap} from 'rxjs';
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {TranslateService} from '@ngx-translate/core';
import {DataWrapper} from '../algo-table/data-wrapper.interface';
import {TableModule} from 'primeng/table';
import {AccordionItemComponent} from './accordion-item/accordion-item.component';
import {ArrayUtils} from '@algonomia/ts-shared';
import {ComponentRendererComponent} from '../../plugs/cell-like-renderer/component-renderer.component';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {IsArrayPipe} from '../../pipes/is-array.pipe';
import {CallFuncOrValPipe} from '../../pipes/call-func-or-val.pipe';
import {TranslateArrPipe} from '../../global-services/translate-wrapper.service';
import {
    StdActionMenuWithPopover
} from '../../design-elements/menus/std-action-menu-with-popover/std-action-menu-with-popover';

@Component({
    selector: 'app-card',
    imports: [
        TableModule,
        AccordionItemComponent,
        ComponentRendererComponent,
        NgTemplateOutlet,
        IsArrayPipe,
        CallFuncOrValPipe,
        TranslateArrPipe,
        AsyncPipe,
        StdActionMenuWithPopover
    ],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent<Data> extends ATemplateComponent  {
    @Input() headerRef?: TemplateRef<{dataWrapper: DataWrapper<Data>}>;
    @Input() set columns(columns: AlgoTableColumns<Data>[]) {
        this._columns$.next(columns);
    }
    @Input() set data(data: Data[]) {
        this._data$.next(data);
    }

    private _columns$ = new ReplaySubject<AlgoTableColumns<Data>[]>(1);
    private _data$ = new ReplaySubject<Data[]>(1);
    __columns: AlgoTableColumns<Data>[] = [];
    __data: DataWrapper<Data>[] = [];

    __mapValuesPerColumn = new Map<string, string[]>(); // Todo : use segmenters to get value + number + filtering optims

    constructor(private _cd: ChangeDetectorRef, private _translate: TranslateService) {
        super();
        this.pipeTakeUntil(this._translate.onLangChange).pipe(
            startWith(undefined),
            switchMap(_ => this._columns$),
            tap(columns => {
                this.__columns = columns;
            }),
            switchMap(_ => this._data$),
            tap(data => {
                this.__data = data.map((x, i) => this._wrapData(x, i + 1));
                this.__mapValuesPerColumn = new Map(this.__columns.map(c => [c.id, ArrayUtils.flattenUniques(this.__data.map(x => x.filterLine[c.id]).sort())]));
                this._cd.markForCheck();
            })
        ).subscribe();
    }

    private _wrapData(d: Data, i: number): DataWrapper<Data> {
        const valueLine: any = {};
        const filterLine: any = {};
        const exportLine: any = {};
        const sortLine: any = {};
        this.__columns.forEach(column => {
            valueLine[column.id] = this._try_translate(column.valueGetter(d));
            filterLine[column.id] = this._try_translate(column.valueGetter(d)) ?? '';
            exportLine[column.id] = this._try_translate(column.valueGetter(d)) ?? '';
            if (!column.sortValue) {
                sortLine[column.id] = valueLine[column.id];
            } else {
                sortLine[column.id] = this._try_translate(column.sortValue(d));
            }
        })
        return {
            line: d,
            line_as_array: [d],
            line_number: i + 1,
            valueLine: valueLine,
            filterLine: filterLine,
            exportLine: exportLine,
            sortLine: sortLine
        }
    }

    private _try_translate(value: any) {
        if (typeof value === 'string' && !!value) {
            return this._translate.instant(value); // replace later
        }
        return value;
    }

    clickCell(event: Event, column: AlgoTableColumns<Data>, line: Data) {
        if (!(column.onClickCell instanceof Function)) {
            return;
        }
        if (!column.onClickCell) {
            return;
        }
        column.onClickCell(line);
        event.stopPropagation();
    }
}
