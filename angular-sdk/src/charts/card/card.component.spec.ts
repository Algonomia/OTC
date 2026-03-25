import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CardComponent } from './card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlgoTableColumns } from '../algo-table/columns.interface';
import { Subject } from 'rxjs';

interface TestData {
    id: number;
    name: string;
    value: string;
}

@Component({
    template: `
        <app-card
            [columns]="columns"
            [data]="data"
            [headerRef]="headerTemplate"
        ></app-card>

        <ng-template #headerTemplate let-dataWrapper="dataWrapper">
            <div class="test-header">Header for {{ dataWrapper.line.name }}</div>
        </ng-template>
    `,
    standalone: true,
    imports: [CardComponent]
})
class TestHostComponent {
    @ViewChild(CardComponent) cardComponent!: CardComponent<TestData>;
    @ViewChild('headerTemplate') headerTemplate!: TemplateRef<unknown>;

    columns: AlgoTableColumns<TestData>[] = [];
    data: TestData[] = [];
}

describe('CardComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: CardComponent<TestData>;
    let translateService: TranslateService;
    let langChangeSubject: Subject<{ lang: string }>;

    function createTestColumns(): AlgoTableColumns<TestData>[] {
        return [
            {
                id: 'name',
                title: 'Name',
                valueGetter: (data) => data.name
            },
            {
                id: 'value',
                title: 'Value',
                valueGetter: (data) => data.value
            }
        ];
    }

    function createTestData(): TestData[] {
        return [
            { id: 1, name: 'Test 1', value: 'Value 1' },
            { id: 2, name: 'Test 2', value: 'Value 2' }
        ];
    }

    function setupCard(columns: AlgoTableColumns<TestData>[], data: TestData[]) {
        host.columns = columns;
        host.data = data;
        fixture.detectChanges();
    }

    beforeEach(async () => {
        langChangeSubject = new Subject<{ lang: string }>();

        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();

        translateService = TestBed.inject(TranslateService);

        spyOn(translateService, 'instant').and.callFake((key: string) => key);
        Object.defineProperty(translateService, 'onLangChange', {
            get: () => langChangeSubject.asObservable()
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.cardComponent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept columns input', () => {
            const columns: AlgoTableColumns<TestData>[] = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: (data) => data.name
                }
            ];
            host.columns = columns;
            fixture.detectChanges();

            expect(component.__columns).toEqual(columns);
        });

        it('should accept data input', () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1', value: 'Value 1' }
            ];
            host.data = data;
            fixture.detectChanges();

            expect(component.__data.length).toBe(1);
            expect(component.__data[0].line).toEqual(data[0]);
        });

        it('should accept headerRef input', () => {
            expect(component.headerRef).toBeTruthy();
            expect(component.headerRef).toBeInstanceOf(TemplateRef);
        });
    });

    describe('Data wrapping', () => {
        beforeEach(() => {
            host.columns = createTestColumns();
        });

        it('should wrap data with correct line_number and create all line types', () => {
            const testData = [{ id: 1, name: 'Test Name', value: 'Test Value' }];
            setupCard(host.columns, testData);

            expect(component.__data[0].line_number).toBe(2);
            expect(component.__data[0].valueLine['name']).toBe('Test Name');
            expect(component.__data[0].valueLine['value']).toBe('Test Value');
            expect(component.__data[0].filterLine['name']).toBe('Test Name');
            expect(component.__data[0].exportLine['name']).toBe('Test Name');
            expect(component.__data[0].sortLine['name']).toBe('Test Name');
        });

        it('should use custom sortValue when provided', () => {
            host.columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: (data: TestData) => data.name,
                    sortValue: (data: TestData) => data.name.toLowerCase()
                } as unknown as AlgoTableColumns<TestData>
            ];
            host.data = [{ id: 1, name: 'TEST NAME', value: 'Value' }];
            fixture.detectChanges();

            expect(component.__data[0].sortLine['name']).toBe('test name');
        });

        it('should handle null/undefined values in filterLine and exportLine', () => {
            host.columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: () => null as unknown as string
                }
            ];
            host.data = [{ id: 1, name: 'Test', value: 'Value' }];
            fixture.detectChanges();

            expect(component.__data[0].filterLine['name']).toBe('');
            expect(component.__data[0].exportLine['name']).toBe('');
        });
    });

    describe('Translation', () => {
        it('should translate string values and update on language change', () => {
            host.columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: () => 'translation.key'
                }
            ];
            host.data = [{ id: 1, name: 'Test', value: 'Value' }];
            fixture.detectChanges();

            expect(translateService.instant).toHaveBeenCalledWith('translation.key');

            langChangeSubject.next({ lang: 'fr' });
            fixture.detectChanges();

            expect(component.__data.length).toBe(1);
        });
    });

    describe('Map values per column', () => {
        it('should create map of unique values per column', () => {
            const columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: (data: TestData) => data.name
                }
            ];
            const data = [
                { id: 1, name: 'Test 1', value: 'Value 1' },
                { id: 2, name: 'Test 2', value: 'Value 2' },
                { id: 3, name: 'Test 1', value: 'Value 3' }
            ];
            setupCard(columns, data);

            const nameValues = component.__mapValuesPerColumn.get('name');
            expect(nameValues).toBeDefined();
            expect(nameValues?.length).toBe(2);
            expect(nameValues).toContain('Test 1');
            expect(nameValues).toContain('Test 2');
        });

        it('should sort values in map', () => {
            const columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: (data: TestData) => data.name
                }
            ];
            const data = [
                { id: 1, name: 'Zebra', value: 'Value 1' },
                { id: 2, name: 'Apple', value: 'Value 2' },
                { id: 3, name: 'Mango', value: 'Value 3' }
            ];
            setupCard(columns, data);

            const nameValues = component.__mapValuesPerColumn.get('name');
            expect(nameValues).toEqual(['Apple', 'Mango', 'Zebra']);
        });
    });

    describe('clickCell method', () => {
        let mockEvent: Event;
        let column: AlgoTableColumns<TestData>;
        let line: TestData;

        beforeEach(() => {
            mockEvent = new Event('click');
            spyOn(mockEvent, 'stopPropagation');

            line = { id: 1, name: 'Test', value: 'Value' };
            column = {
                id: 'name',
                title: 'Name',
                valueGetter: (data: TestData) => data.name
            } as unknown as AlgoTableColumns<TestData>;
        });

        it('should call onClickCell and stop propagation when it is a function', () => {
            const onClickSpy = jasmine.createSpy('onClickCell');
            column = {
                ...column,
                onClickCell: onClickSpy
            } as unknown as AlgoTableColumns<TestData>;

            component.clickCell(mockEvent, column, line);

            expect(onClickSpy).toHaveBeenCalledWith(line);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should not throw or stop propagation when onClickCell is undefined, null or not a function', () => {
            expect(() => component.clickCell(mockEvent, column, line)).not.toThrow();
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();

            const columnWithNull = {
                ...column,
                onClickCell: null as unknown as ((line: TestData) => void)
            } as unknown as AlgoTableColumns<TestData>;
            expect(() => component.clickCell(mockEvent, columnWithNull, line)).not.toThrow();
        });
    });

    describe('Template Rendering', () => {
        beforeEach(() => {
            host.columns = [
                {
                    id: 'name',
                    title: 'Name Column',
                    valueGetter: (data) => data.name
                }
            ];
            host.data = [
                { id: 1, name: 'Test 1', value: 'Value 1' }
            ];
            fixture.detectChanges();
        });

        describe('container', () => {
            it('should render data-container for each data item', () => {
                const container = fixture.nativeElement.querySelector('.container');
                expect(container).toBeTruthy();

                let containers = fixture.nativeElement.querySelectorAll('.data-container');
                expect(containers.length).toBe(1);

                host.data = createTestData();
                fixture.detectChanges();

                containers = fixture.nativeElement.querySelectorAll('.data-container');
                expect(containers.length).toBe(2);
            });
        });

        describe('header template', () => {
            it('should render header template with dataWrapper when headerRef is provided', () => {
                const header = fixture.nativeElement.querySelector('.test-header');
                expect(header).toBeTruthy();
                expect(header.textContent).toContain('Test 1');
            });
        });

        describe('accordion items', () => {
            it('should only render accordion-item for columns with values', () => {
                let accordions = fixture.nativeElement.querySelectorAll('app-accordion-item');
                expect(accordions.length).toBe(1);

                host.columns = [
                    {
                        id: 'name',
                        title: 'Name',
                        valueGetter: (data: TestData) => data.name
                    },
                    {
                        id: 'empty',
                        title: 'Empty',
                        valueGetter: () => null as unknown as string
                    }
                ];
                fixture.detectChanges();

                accordions = fixture.nativeElement.querySelectorAll('app-accordion-item');
                expect(accordions.length).toBe(1);
            });
        });

        describe('hr separator', () => {
            it('should render hr separators between data items', () => {
                let hr = fixture.nativeElement.querySelector('hr.hr');
                expect(hr).toBeFalsy();

                const data = createTestData();
                setupCard(host.columns, data);
                let hrs = fixture.nativeElement.querySelectorAll('hr.hr');
                expect(hrs.length).toBe(1);

                const threeItems = [...data, { id: 3, name: 'Test 3', value: 'Value 3' }];
                setupCard(host.columns, threeItems);
                hrs = fixture.nativeElement.querySelectorAll('hr.hr');
                expect(hrs.length).toBe(2);
            });
        });

        describe('card value', () => {
            it('should render card-value with width-100 and cursor-pointer when onClickCell is defined', () => {
                let cardValue = fixture.nativeElement.querySelector('.card-value');
                expect(cardValue).toBeTruthy();
                expect(cardValue.classList.contains('width-100')).toBe(true);
                expect(cardValue.classList.contains('cursor-pointer')).toBe(false);

                host.columns = [
                    {
                        id: 'name',
                        title: 'Name',
                        valueGetter: (data: TestData) => data.name,
                        onClickCell: jasmine.createSpy('onClickCell')
                    } as unknown as AlgoTableColumns<TestData>
                ];
                fixture.detectChanges();

                cardValue = fixture.nativeElement.querySelector('.card-value');
                expect(cardValue.classList.contains('cursor-pointer')).toBe(true);

                const box = fixture.nativeElement.querySelector('.box-main-1');
                expect(box).toBeTruthy();
                expect(box.textContent.trim()).toContain('Test 1');
            });
        });
    });

    describe('Empty data scenarios', () => {
        it('should handle empty data array', () => {
            host.columns = [
                {
                    id: 'name',
                    title: 'Name',
                    valueGetter: (data) => data.name
                }
            ];
            host.data = [];
            fixture.detectChanges();

            expect(component.__data.length).toBe(0);
            const containers = fixture.nativeElement.querySelectorAll('.data-container');
            expect(containers.length).toBe(0);
        });

        it('should handle empty columns array', () => {
            host.columns = [];
            host.data = [{ id: 1, name: 'Test', value: 'Value' }];
            fixture.detectChanges();

            expect(component.__columns.length).toBe(0);
            const accordions = fixture.nativeElement.querySelectorAll('app-accordion-item');
            expect(accordions.length).toBe(0);
        });
    });
});
