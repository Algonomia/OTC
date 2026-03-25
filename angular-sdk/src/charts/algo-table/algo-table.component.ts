import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef, EventEmitter,
    Input, Output,
    ViewChild
} from '@angular/core';
import {AlgoTableColumns} from './columns.interface';
import {
    BehaviorSubject,
    ReplaySubject,
    startWith, Subject,
    switchMap,
    tap
} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {SortEvent} from 'primeng/api';
import {MultiSelect} from 'primeng/multiselect';
import {AsyncPipe, NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';
import {DataWrapper} from './data-wrapper.interface';
import {ArrayUtils, NullUndefinedUtils} from '@algonomia/ts-shared';
import {ComponentRendererComponent} from '../../plugs/cell-like-renderer/component-renderer.component';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {TooltipModule} from 'primeng/tooltip';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';
import {ExcelExportService} from '../../global-services/data-export/excel-export.service';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {
    IAction, StdActionsMenuComponent
} from '../../design-elements/menus/std-actions-menu/std-actions-menu.component';
import {CallFuncOrValPipe} from '../../pipes/call-func-or-val.pipe';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {distinctUntilChanged} from 'rxjs/operators';
import {ESelectionMode, SelectHandler, SelectionState} from '../../handlers/select-handler/select-handler';
import {
    SelectAllCheckboxComponent
} from '../../design-elements/select-handlers/select-all-checkbox/select-all-checkbox.component';
import {
    SingleSelectBoxComponent
} from '../../design-elements/select-handlers/single-select-box/single-select-box.component';
import {MapGetPipe} from '../../pipes/map-get.pipe';
import {ConcatStrPipe} from '../../pipes/concat-str.pipe';
import {SetHasPipe} from '../../pipes/set-has.pipe';
import {TranslateArrPipe} from '../../global-services/translate-wrapper.service';
import {Popover} from 'primeng/popover';

export type TableTheme = undefined | 'theme-2';

@Component({
    selector: 'app-algo-table',
    imports: [
        TableModule,
        TooltipModule,
        TranslateModule,
        AlgoIconComponent,
        MultiSelect,
        FormsModule,
        NgTemplateOutlet,
        ComponentRendererComponent,
        CallFuncOrValPipe,
        AsyncPipe,
        SelectAllCheckboxComponent,
        SingleSelectBoxComponent,
        MapGetPipe,
        ConcatStrPipe,
        NgClass,
        SetHasPipe,
        NgStyle,
        TranslateArrPipe,
        Popover,
        StdActionsMenuComponent
    ],
    templateUrl: './algo-table.component.html',
    styleUrl: './algo-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableComponent<Data> extends ATemplateWithResizablesComponent implements AfterViewInit {
    @ViewChild('wrapper') wrapper!: ElementRef;
    @ViewChild('main') main!: ElementRef;
    @ViewChild('table') table!: Table;
    @Input() bordered: boolean = true;
    @Input() onClickLine?: (x: Data) => unknown;
    @Input() set columns(columns: AlgoTableColumns<Data>[]) {
        this._columns$.next(columns);
    }
    @Input() set data(data: Data[] | SelectHandler<any, Data>) {
        if (data instanceof SelectHandler) {
            this.selectHandler$.next(data);
        } else {
            this.selectHandler$.next(SelectHandler.getFakeSelectHandlerForEncapsulation(data));
        }
    }
    @Input() set exportable(isExportable: boolean | ((lines: any[]) => boolean)) {
        this.__isExportableParam = isExportable;
        if (typeof isExportable === 'boolean') {
            this.__exportable = isExportable;
        }
    }

    @Output() onSelect = new EventEmitter<any>;

    @Input() tableTheme: TableTheme = undefined;

    __isExportableParam: boolean | ((lines: any[]) => boolean) = false;
    __exportable = false;

    __infoBarHeightPx = 35;
    __scrollHeightPx = 3;
    __wrapperHeight = `calc(100% - ${this.__infoBarHeightPx}px)`;
    __infoBarHeightText = `${this.__infoBarHeightPx}px`;
    __scrollSize = '';

    private _columns$ = new ReplaySubject<AlgoTableColumns<Data>[]>(1);
    private _rawData: Data[] = [];

    protected __columns: AlgoTableColumns<Data>[] = [];
    protected __data: DataWrapper<Data>[] = [];
    protected __mapValuesPerColumn = new Map<string, string[]>(); // Todo : use segmenters to get value + number + filtering optims
    protected __setVisibleColumns = new Set<AlgoTableColumns<Data>>();
    protected __setMultiActionColumns = new Set<AlgoTableColumns<Data>>();
    protected __mapColumnMultiActions = new Map<AlgoTableColumns<Data>, IAction<Data[]>[]>();

    protected __selectionMode = ESelectionMode.none;
    selectHandler$ = new BehaviorSubject<SelectHandler<Data, any>>(
        SelectHandler.getFakeSelectHandlerForEncapsulation<Data>([])
    );
    protected __selectHandler: SelectHandler<Data, any> = this.selectHandler$.getValue();

    __askForUpdateSizes$ = new Subject<void>();

    constructor(
        private _cd: ChangeDetectorRef,
        private _translate: TranslateService,
        private _excelExportService: ExcelExportService
    ) {
        super();
    }

    public clickRowData(data: DataWrapper<Data>) {
        if (!this.selectHandler$.getValue()) return;
        this.selectHandler$.getValue().switch(data.line);
    }

    ngAfterViewInit() {
        this._setVirtualScrollResizeSubject();
        this._setNewInputEvents();
    }

    private _setVirtualScrollResizeSubject() {
        this.resizeObservable().subscribe(() => {
            const mainHeight = this.main?.nativeElement.offsetHeight;
            const scrollSizePx = Math.max(0, mainHeight - this.__infoBarHeightPx - this.__scrollHeightPx);
            this.__scrollSize = `calc(max(${scrollSizePx}px, 100%))`;
            this.__askForUpdateSizes$.next();
        });
    }

    private _setNewInputEvents() {
        this.pipeTakeUntil(this._translate.onLangChange).pipe(
            startWith(undefined),
            switchMap(() => this._columns$.pipe(distinctUntilChanged())),
            tap(columns => {
                this.__columns = ArrayUtils.convertThenSort(columns, ((x: AlgoTableColumns<Data>) => {
                    if (x.frozen && x.alignFrozen === 'left') {
                        return 0;
                    } else if (x.frozen && x.alignFrozen === 'right') {
                        return 2;
                    }
                    return 1;
                }));
            }),
            switchMap(() => this.selectHandler$.pipe(distinctUntilChanged())),
            switchMap(() => this.selectHandler$.getValue().list$.pipe(distinctUntilChanged())),
            tap(list => {
                this.__selectHandler = this.selectHandler$.getValue();
                this.__selectionMode = this.__selectHandler.selectionMode;
                this._rawData = list;
                this.table?.clearFilterValues();
            }),
            switchMap(_ => {
                return fromPromise(new Promise(async (resolve: any) => {
                    this.__setVisibleColumns = new Set(await this._getVisibleColumns(this.__columns, this._rawData));
                    this.__setMultiActionColumns = new Set(this.__columns.filter(x => Array.isArray(x.onClickCell)));

                    const __mapColumnMultiActions = new Map();
                    this.__columns.forEach(c => {
                        if (Array.isArray(c.onClickCell)) {
                            __mapColumnMultiActions.set(c, c.onClickCell);
                        }
                    });
                    this.__mapColumnMultiActions = __mapColumnMultiActions;
                    resolve()
                }));
            }),
            tap(() => {
                this.__data = this._rawData.map((x, i) => this._wrapData(x, i + 1));
                this.__mapValuesPerColumn = new Map(this.__columns.map(
                    c => [
                        c.id, ArrayUtils.flattenUniques(this.__data.map(x => x.filterLine[c.id]).sort())
                    ]
                ));
            }),
            switchMap(() => this.__askForUpdateSizes$.pipe(startWith(undefined))),
        ).subscribe(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.__exportable = this._isExportable();
                    this._setVirtualScrollWithAutosizeHackStep1();
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            this._setVirtualScrollWithAutosizeHackStep2();
                        });
                    });
                });
            });
            this._cd.markForCheck();
        });
    }

    __tableLayout = 'auto';
    // STEP 1 : Reactivating virtual scroll and autosizing with layout auto
    private _setVirtualScrollWithAutosizeHackStep1() {
        this.__tableLayout = 'auto';
        this._cd.detectChanges();
    }

    // STEP 2 : Locking with layout fixed, prevents virtualscroll autoresizing
    private _setVirtualScrollWithAutosizeHackStep2() {
        this.__tableLayout = 'fixed';
        this._lockColumnWidths();
        this._cd.detectChanges();
    }

    private _lockColumnWidths() {
        const tableEl = this.wrapper?.nativeElement?.querySelector('.p-datatable') as HTMLElement;
        if (!tableEl) return;

        const headers = tableEl.querySelectorAll('.p-datatable-thead th');
        const rows = tableEl.querySelectorAll('.p-datatable-tbody tr');

        headers.forEach((th, colIndex) => {
            const width = (th as HTMLElement).offsetWidth + 'px';

            // Lock the <th>
            (th as HTMLElement).style.width = width;

            // Lock the <td>s in all visible rows
            rows.forEach((row: Element) => {
                const td = row.children[colIndex] as HTMLElement;
                if (td) {
                    td.style.width = width;
                }
            });
        });
    }

    private _isExportable() {
        if (typeof this.__isExportableParam === 'boolean') {
            return this.__isExportableParam;
        } else {
            const data: DataWrapper<Data>[] =  this.table?.filteredValue ?? this.__data;
            return this.__isExportableParam(data.map(x => x.exportLine));
        }
    }

    private async _getVisibleColumns(columns: AlgoTableColumns<Data>[], data: Data[]) {
        const areVisiblePromises = columns.map(async col => col.show ? await col.show(data) : true);
        const areVisible = await Promise.all(areVisiblePromises);
        return columns.filter((x, i) => areVisible[i]);
    }

    private _wrapData(d: Data, i: number): DataWrapper<Data> {
        const valueLine: any = {};
        const filterLine: any = {};
        const exportLine: any = {};
        const sortLine: any = {};
        this.__columns.forEach(column => {
            const translateValue = this._try_translate(column.valueGetter(d)) ?? '';
            valueLine[column.id] = translateValue;
            filterLine[column.id] = Array.isArray(translateValue) ? translateValue.join(', ') : translateValue;
            exportLine[column.id] = translateValue;
            if (!column.sortValue) {
                sortLine[column.id] = translateValue;
            } else {
                sortLine[column.id] = this._try_translate(column.sortValue(d));
            }
        });
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
    sortParams: {field: string, order: number} = {field: '.', order: -1};
    onSort(field: string) {
        if (this.sortParams.field !== field || this.sortParams.field === '.') {
            this.sortParams = {field: field, order: 1};
        } else if (this.sortParams.order === 1) {
            this.sortParams = {field: field, order: -1};
        } else if (this.sortParams.order === -1) {
            this.sortParams = {field: '.', order: -1};
        }
        this._cd.markForCheck();
    }

    customSort(event: SortEvent) {
        const field = event?.field ?? '';
        const order = event?.order ?? 0;

        event?.data?.sort((v1: DataWrapper<Data>, v2: DataWrapper<Data>) => {
            if (field === '.') {
                return v1.line_number - v2.line_number;
            }
            const sortV1 = v1.sortLine[field] ?? null;
            const sortV2 = v2.sortLine[field] ?? null;
            if (order === 1) {
                return ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR(sortV1, sortV2);
            } else if (order === -1) {
                return ArrayUtils.STANDARD_GENERAL_ARR_COMPARATOR_REVERSE(sortV1, sortV2);
            }
            return 0;
        });
    }

    async exportTableToExcel(): Promise<void> {
        if (!this.__exportable) {
            return;
        }
        const data = this.table?.filteredValue ?? this.__data;

        const exportData = data.map(item => {
            const flatRow: any = {};
            this.__columns.forEach(col => {
                flatRow[this._translate.instant(col.title)] = item.exportLine[col.id];
            });
            return flatRow;
        });

        const headers = this.__columns.map(col => this._translate.instant(col.title));

        await this._excelExportService.exportToExcel(exportData, headers, {
            worksheetName: 'Data',
            fileName: 'ExportedData.xlsx',
            boldHeaders: true,
            columnAlignment: {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            }
        });
    }

    protected __activeFilterColumnSet = new Set<AlgoTableColumns<Data>>();
    updateActiveFilterColumns() {
        this.__activeFilterColumnSet = new Set<AlgoTableColumns<Data>>(
            this.__columns.filter(x => this.__isActiveFilter(x))
        )
    }

    private __isActiveFilter(column: AlgoTableColumns<Data>): boolean {
        const filters = [this.table?.filters[`filterLine.${column.id}`]].flat().filter(x => !isNullOrUndefined(x));
        return filters.some(f => {
            if (!f) {
                return false;
            }
            const value = f?.value;
            if (value === null || value === undefined) {
                return false;
            }
            if (value === '') {
                return false;
            }
            if (Array.isArray(value) && value.length === 0) {
                return false;
            }
            return true;
        });
    }

    protected readonly SelectionState = SelectionState;
    protected readonly ESelectionMode = ESelectionMode;
    protected readonly Math = Math;


    get count() {
        return (this.table?.filteredValue || this.table?.value || this.__data || []).length;
    }

    clickCell(event: Event, column: AlgoTableColumns<Data>, data: DataWrapper<Data>) {
        if (Array.isArray(column.onClickCell)) {
            this._openActionPopover(event, column.onClickCell, column, data);
        } else if (!!column.onClickCell) {
            column.onClickCell(data.line);
        } else {
            return;
        }
        event.stopPropagation();
    }

    @ViewChild('popover') popover!: Popover;
    protected __currentPopoverColumn?: AlgoTableColumns<Data>;
    protected __currentPopoverActions?: IAction<Data[]>[];
    protected __currentPopoverData?: DataWrapper<Data>;
    protected __popoverVisible = false;
    private _openActionPopover(event: any, actions: IAction<Data[]>[], column: AlgoTableColumns<Data>, data: DataWrapper<Data>) {
        if (this.__popoverVisible && column === this.__currentPopoverColumn && data === this.__currentPopoverData) {
            this.popover.hide();
        } else {
            this.__currentPopoverColumn = column;
            this.__currentPopoverActions = actions;
            this.__currentPopoverData = data;
            this.popover.show(event);
            if (this.popover.container) {
                this.popover.align();
            }
        }
    }

    onPopoverShow() {
        this.__popoverVisible = true;
    }

    onPopoverHide() {
        this.__currentPopoverColumn = undefined;
        this.__currentPopoverActions = undefined;
        this.__currentPopoverData = undefined;
        this.__popoverVisible = false;
    }

    protected __onAction() {
        this.popover.hide();
        this.__popoverVisible = false;
    }

    protected override __onDestroy() {
        if (this.__popoverVisible) {
            this.popover.hide();
        }
        super.__onDestroy();
    }
}
