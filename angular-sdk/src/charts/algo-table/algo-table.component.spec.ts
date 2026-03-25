import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AlgoTableComponent } from './algo-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlgoTableColumns } from './columns.interface';
import { Subject } from 'rxjs';
import { SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import FileSaver from 'file-saver';
import { DataWrapper } from './data-wrapper.interface';

interface TestData {
    id: number;
    name: string;
    value: string;
    amount: number;
}

describe('AlgoTableComponent', () => {
    const DEBOUNCE_TIME = 150;
    const DEFAULT_INFO_BAR_HEIGHT = 35;
    const DEFAULT_SCROLL_HEIGHT = 3;

    let fixture: ComponentFixture<AlgoTableComponent<TestData>>;
    let component: AlgoTableComponent<TestData>;
    let translateService: TranslateService;
    let langChangeSubject: Subject<{ lang: string }>;

    function createTestData(): TestData[] {
        return [
            { id: 1, name: 'Test 1', value: 'Value 1', amount: 100 },
            { id: 2, name: 'Test 2', value: 'Value 2', amount: 200 }
        ];
    }

    function createColumn(overrides: Partial<AlgoTableColumns<TestData>> = {}): AlgoTableColumns<TestData> {
        return {
            id: 'name',
            title: 'Name',
            valueGetter: (data: TestData) => data.name,
            ...overrides
        } as AlgoTableColumns<TestData>;
    }

    function createDefaultColumns(): AlgoTableColumns<TestData>[] {
        return [createColumn()];
    }

    function setupTableWithData(columns: AlgoTableColumns<TestData>[], data: TestData[]) {
        fixture.componentRef.setInput('columns', columns);
        fixture.componentRef.setInput('data', data);
        fixture.detectChanges();
    }

    function getTableData(): unknown[] {
        return (component as unknown as { __data: unknown[] }).__data || [];
    }

    function setTableFilters(columnId: string, value: string | string[] | null | undefined) {
        component.table = {
            filters: {
                [`filterLine.${columnId}`]: { value }
            }
        } as Table;
    }

    beforeEach(async () => {
        langChangeSubject = new Subject<{ lang: string }>();

        await TestBed.configureTestingModule({
            imports: [AlgoTableComponent, TranslateModule.forRoot()]
        }).compileComponents();

        translateService = TestBed.inject(TranslateService);

        spyOn(translateService, 'instant').and.callFake((key: string) => key);
        Object.defineProperty(translateService, 'onLangChange', {
            get: () => langChangeSubject.asObservable()
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableComponent<TestData>);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept bordered input', () => {
            fixture.componentRef.setInput('bordered', false);
            expect(component.bordered).toBe(false);
        });

        it('should accept onClickLine input', () => {
            const clickFn = jasmine.createSpy('onClickLine');
            fixture.componentRef.setInput('onClickLine', clickFn);
            expect(component.onClickLine).toBe(clickFn);
        });

        it('should accept exportable input as boolean', () => {
            fixture.componentRef.setInput('exportable', true);
            expect(component.__isExportableParam).toBe(true);
        });

        it('should accept exportable input as function', () => {
            const exportFn = (lines: TestData[]) => lines.length > 0;
            fixture.componentRef.setInput('exportable', exportFn);
            expect(component.__isExportableParam).toBe(exportFn);
        });

        it('should have default bordered value as true', () => {
            expect(component.bordered).toBe(true);
        });
    });

    describe('Sorting', () => {
        describe('onSort method', () => {
            it('should set sortParams on first click', () => {
                component.onSort('name');

                expect(component.sortParams.field).toBe('name');
                expect(component.sortParams.order).toBe(1);
            });

            it('should toggle order to -1 on second click', () => {
                component.onSort('name');
                component.onSort('name');

                expect(component.sortParams.field).toBe('name');
                expect(component.sortParams.order).toBe(-1);
            });

            it('should reset to default on third click', () => {
                component.onSort('name');
                component.onSort('name');
                component.onSort('name');

                expect(component.sortParams.field).toBe('.');
                expect(component.sortParams.order).toBe(-1);
            });

            it('should change field when clicking different column', () => {
                component.onSort('name');
                component.onSort('value');

                expect(component.sortParams.field).toBe('value');
                expect(component.sortParams.order).toBe(1);
            });

            it('should start with default sortParams', () => {
                expect(component.sortParams.field).toBe('.');
                expect(component.sortParams.order).toBe(-1);
            });
        });

        describe('customSort method', () => {
            it('should not throw error with valid sort event', fakeAsync(() => {
                const data = [
                    { id: 1, name: 'Zebra', value: 'Value 1', amount: 300 },
                    { id: 2, name: 'Apple', value: 'Value 2', amount: 100 }
                ];
                setupTableWithData(createDefaultColumns(), data);
                tick(DEBOUNCE_TIME);

                const tableData = getTableData();
                const sortEvent: SortEvent = {
                    field: 'name',
                    order: 1,
                    data: tableData.length > 0 ? [...tableData] : []
                };

                expect(() => component.customSort(sortEvent)).not.toThrow();
            }));

            it('should sort by line_number when field is "."', fakeAsync(() => {
                const data = [
                    { id: 3, name: 'C', value: 'Val', amount: 300 },
                    { id: 1, name: 'A', value: 'Val', amount: 100 }
                ];
                setupTableWithData(createDefaultColumns(), data);
                tick(DEBOUNCE_TIME);

                const tableData = getTableData();
                const sortEvent: SortEvent = {
                    field: '.',
                    order: 1,
                    data: tableData.length > 0 ? [...tableData] : []
                };

                component.customSort(sortEvent);

                if (sortEvent.data && sortEvent.data.length > 1) {
                    const firstItem = sortEvent.data[0] as { line_number: number };
                    const secondItem = sortEvent.data[1] as { line_number: number };
                    expect(firstItem.line_number).toBeLessThan(secondItem.line_number);
                }
            }));
        });
    });

    describe('clickCell method', () => {
        let mockEvent: Event;
        let column: AlgoTableColumns<TestData>;
        let wrappedLine: DataWrapper<TestData>;

        beforeEach(() => {
            mockEvent = new Event('click');
            spyOn(mockEvent, 'stopPropagation');

            const rawLine: TestData = { id: 1, name: 'Test', value: 'Value', amount: 100 };
            wrappedLine = {
                line: rawLine,
                line_as_array: [rawLine],
                sortLine: {},
                filterLine: {},
                valueLine: {},
                exportLine: {},
                line_number: 0
            };
            column = createColumn();
        });

        it('should call onClickCell when it is a function', () => {
            const onClickSpy = jasmine.createSpy('onClickCell');
            column = createColumn({ onClickCell: onClickSpy });

            component.clickCell(mockEvent, column, wrappedLine);

            expect(onClickSpy).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should not call anything when onClickCell is undefined', () => {
            expect(() => component.clickCell(mockEvent, column, wrappedLine)).not.toThrow();
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        });

        it('should not call anything when onClickCell is null', () => {
            column = createColumn({ onClickCell: null as unknown as ((line: TestData) => void) });

            expect(() => component.clickCell(mockEvent, column, wrappedLine)).not.toThrow();
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        });

        it('should stop propagation when onClickCell is called', () => {
            const onClickSpy = jasmine.createSpy('onClickCell');
            column = createColumn({ onClickCell: onClickSpy });

            component.clickCell(mockEvent, column, wrappedLine);

            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('count getter', () => {
        it('should return 0 when table is not initialized', () => {
            expect(component.count).toBe(0);
        });

        it('should return number of items from table value', fakeAsync(() => {
            const data = createTestData();
            setupTableWithData(createDefaultColumns(), data);
            tick(DEBOUNCE_TIME);

            const tableData = getTableData();
            component.table = {
                value: tableData,
                filteredValue: null
            } as Table;

            expect(component.count).toBe(tableData.length);
        }));

        it('should return number of filtered items when filteredValue exists', fakeAsync(() => {
            const data = createTestData();
            setupTableWithData(createDefaultColumns(), data);
            tick(DEBOUNCE_TIME);

            const tableData = getTableData();
            const filteredData = tableData.length > 0 ? [tableData[0]] : [];
            component.table = {
                value: tableData,
                filteredValue: filteredData
            } as Table;

            expect(component.count).toBe(filteredData.length);
        }));
    });

    describe('exportTableToExcel method', () => {
        it('should export data to Excel without downloading file', async () => {
            spyOn(FileSaver, 'saveAs');

            const columns = [
                createColumn({ id: 'name', title: 'table.name' }),
                createColumn({ id: 'value', title: 'table.value', valueGetter: (data: TestData) => data.value })
            ];
            const data = [{ id: 1, name: 'Test 1', value: 'Value 1', amount: 100 }];
            fixture.componentRef.setInput('exportable', true);
            setupTableWithData(columns, data);
            await fixture.whenStable();

            const tableData = getTableData();
            component.table = {
                value: tableData,
                filteredValue: null
            } as Table;

            await component.exportTableToExcel();

            expect(FileSaver.saveAs).toHaveBeenCalled();
            expect(FileSaver.saveAs).toHaveBeenCalledWith(jasmine.any(Blob), 'ExportedData.xlsx');
        });
    });

    describe('Component initialization', () => {
        it('should have default __infoBarHeightPx', () => {
            expect(component.__infoBarHeightPx).toBe(DEFAULT_INFO_BAR_HEIGHT);
        });

        it('should have default __scrollHeightPx', () => {
            expect(component.__scrollHeightPx).toBe(DEFAULT_SCROLL_HEIGHT);
        });

        it('should calculate __wrapperHeight based on __infoBarHeightPx', () => {
            expect(component.__wrapperHeight).toBe(`calc(100% - ${DEFAULT_INFO_BAR_HEIGHT}px)`);
        });

        it('should start with auto table layout', () => {
            expect(component.__tableLayout).toBe('auto');
        });
    });
});
