import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WorldMapComponent } from './world-map.component';
import { QueryParamsSynchronizerService } from '../../global-services/query-params-synchronizer.service';
import { of, Subject } from 'rxjs';

interface WorldMapData {
    id: string;
    value?: number;
    name?: string;
    [key: string]: unknown;
}

describe('WorldMapComponent', () => {
    let component: WorldMapComponent;
    let fixture: ComponentFixture<WorldMapComponent>;
    let mockQueryParamsService: jasmine.SpyObj<QueryParamsSynchronizerService>;

    beforeEach(async () => {
        mockQueryParamsService = jasmine.createSpyObj('QueryParamsSynchronizerService', ['synchronize']);
        mockQueryParamsService.synchronize.and.returnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [WorldMapComponent],
            providers: [
                { provide: QueryParamsSynchronizerService, useValue: mockQueryParamsService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WorldMapComponent);
        component = fixture.componentInstance;

        spyOn(component, 'ngAfterViewInit').and.stub();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        describe('valueKey', () => {
            it('should update _valueKeySubject when valueKey is set', fakeAsync(() => {
                let emittedValue: string = '';
                component['_valueKeySubject'].subscribe(value => {
                    emittedValue = value;
                });

                fixture.componentRef.setInput('valueKey', 'testKey');
                tick();

                expect(emittedValue).toBe('testKey');
            }));

            it('should emit multiple times when valueKey changes', fakeAsync(() => {
                const emittedValues: string[] = [];
                component['_valueKeySubject'].subscribe(value => {
                    emittedValues.push(value);
                });

                fixture.componentRef.setInput('valueKey', 'key1');
                tick();
                fixture.componentRef.setInput('valueKey', 'key2');
                tick();
                fixture.componentRef.setInput('valueKey', 'key3');
                tick();

                expect(emittedValues).toContain('key1');
                expect(emittedValues).toContain('key2');
                expect(emittedValues).toContain('key3');
            }));
        });

        describe('data', () => {
            it('should update _dataSubject when data is set', fakeAsync(() => {
                let emittedData: WorldMapData[] = [];
                component['_dataSubject'].subscribe(data => {
                    emittedData = data as WorldMapData[];
                });

                const testData: WorldMapData[] = [{ id: 'US', value: 100 }, { id: 'FR', value: 50 }];
                fixture.componentRef.setInput('data', testData);
                tick();

                expect(emittedData).toEqual(testData);
            }));

            it('should handle empty data array', fakeAsync(() => {
                let emittedData: WorldMapData[] = [];
                component['_dataSubject'].subscribe(data => {
                    emittedData = data as WorldMapData[];
                });

                fixture.componentRef.setInput('data', []);
                tick();

                expect(emittedData).toEqual([]);
            }));

            it('should handle data with various country codes', fakeAsync(() => {
                let emittedData: WorldMapData[] = [];
                component['_dataSubject'].subscribe(data => {
                    emittedData = data as WorldMapData[];
                });

                const testData: WorldMapData[] = [
                    { id: 'US', value: 100, name: 'United States' },
                    { id: 'GB', value: 80, name: 'United Kingdom' },
                    { id: 'JP', value: 60, name: 'Japan' }
                ];
                fixture.componentRef.setInput('data', testData);
                tick();

                expect(emittedData.length).toBe(3);
                expect(emittedData).toEqual(testData);
            }));
        });

        describe('isActiveParamKey', () => {
            it('should not call synchronization when key is empty', () => {
                fixture.componentRef.setInput('isActiveParamKey', '');

                expect(mockQueryParamsService.synchronize).not.toHaveBeenCalled();
            });

            it('should not call synchronization when key is undefined', () => {
                fixture.componentRef.setInput('isActiveParamKey', undefined);

                expect(mockQueryParamsService.synchronize).not.toHaveBeenCalled();
            });

            it('should call synchronization when valid key is provided', () => {
                fixture.componentRef.setInput('isActiveParamKey', 'country');

                expect(mockQueryParamsService.synchronize).toHaveBeenCalledWith(
                    'country',
                    component['__preselectCountry$'],
                    jasmine.any(Function)
                );
            });

            it('should update __preselectCountry$ when synchronization reaction is called', fakeAsync(() => {
                let capturedReaction: ((country: string) => void) | undefined;
                mockQueryParamsService.synchronize.and.callFake((_key: string, _subject: unknown, reaction: (country: string) => void) => {
                    capturedReaction = reaction;
                    return of(undefined);
                });

                fixture.componentRef.setInput('isActiveParamKey', 'country');
                tick();

                let preselectedCountry: string | undefined;
                component['__preselectCountry$'].subscribe(country => {
                    preselectedCountry = country;
                });

                capturedReaction?.('US');
                tick();

                expect(preselectedCountry).toBe('US');
            }));
        });
    });

    describe('Output events', () => {
        it('should have activeData EventEmitter', () => {
            expect(component.activeData).toBeDefined();
        });

        it('should have activeIso2 EventEmitter', () => {
            expect(component.activeIso2).toBeDefined();
        });

        it('should emit activeData when set', fakeAsync(() => {
            let emittedData: WorldMapData | undefined;
            component.activeData.subscribe(data => {
                emittedData = data;
            });

            const testData: WorldMapData = { id: 'US', value: 100 };
            component.activeData.next(testData);
            tick();

            expect(emittedData).toEqual(testData);
        }));

        it('should emit activeIso2 when set', fakeAsync(() => {
            let emittedIso2: string | undefined;
            component.activeIso2.subscribe(iso2 => {
                emittedIso2 = iso2;
            });

            component.activeIso2.next('FR');
            tick();

            expect(emittedIso2).toBe('FR');
        }));
    });

    describe('BehaviorSubjects', () => {
        it('should initialize _dataSubject with empty array', fakeAsync(() => {
            let initialValue: WorldMapData[] = [];
            component['_dataSubject'].subscribe(data => {
                initialValue = data as WorldMapData[];
            });
            tick();

            expect(initialValue).toEqual([]);
        }));

        it('should initialize _valueKeySubject with empty string', fakeAsync(() => {
            let initialValue: string = 'not-empty';
            component['_valueKeySubject'].subscribe(value => {
                initialValue = value;
            });
            tick();

            expect(initialValue).toBe('');
        }));

        it('should initialize __preselectCountry$ with undefined', fakeAsync(() => {
            let initialValue: string | undefined = 'not-undefined';
            component['__preselectCountry$'].subscribe(country => {
                initialValue = country;
            });
            tick();

            expect(initialValue).toBeUndefined();
        }));
    });

    describe('_setActive method', () => {
        it('should return early if _polygonSeries is not initialized', () => {
            component['_polygonSeries'] = undefined;

            expect(() => {
                component['_setActive']('US');
            }).not.toThrow();
        });

        it('should return early if country is null', () => {
            component['_polygonSeries'] = {
                getDataItemById: jasmine.createSpy('getDataItemById')
            };

            component['_setActive'](null!);

            expect(component['_polygonSeries'].getDataItemById).not.toHaveBeenCalled();
        });

        it('should return early if country is undefined', () => {
            component['_polygonSeries'] = {
                getDataItemById: jasmine.createSpy('getDataItemById')
            };

            component['_setActive'](undefined);

            expect(component['_polygonSeries'].getDataItemById).not.toHaveBeenCalled();
        });

        it('should call getDataItemById with country code when valid', () => {
            const mockPolygonSeries = {
                getDataItemById: jasmine.createSpy('getDataItemById').and.returnValue(null)
            };
            component['_polygonSeries'] = mockPolygonSeries;

            component['_setActive']('FR');

            expect(mockPolygonSeries.getDataItemById).toHaveBeenCalledWith('FR');
        });

        it('should set active to true on polygon when found', () => {
            const mockMapPolygon = {
                set: jasmine.createSpy('set')
            };
            const mockPolygonItem = {
                get: jasmine.createSpy('get').and.returnValue(mockMapPolygon)
            };
            const mockPolygonSeries = {
                getDataItemById: jasmine.createSpy('getDataItemById').and.returnValue(mockPolygonItem)
            };
            component['_polygonSeries'] = mockPolygonSeries;

            component['_setActive']('DE');

            expect(mockPolygonItem.get).toHaveBeenCalledWith('mapPolygon');
            expect(mockMapPolygon.set).toHaveBeenCalledWith('active', true);
        });

        it('should not throw error when polygon item is not found', () => {
            const mockPolygonSeries = {
                getDataItemById: jasmine.createSpy('getDataItemById').and.returnValue(null)
            };
            component['_polygonSeries'] = mockPolygonSeries;

            expect(() => {
                component['_setActive']('INVALID');
            }).not.toThrow();
        });

        it('should mark for check when setting active', () => {
            const mockMapPolygon = {
                set: jasmine.createSpy('set')
            };
            const mockPolygonItem = {
                get: jasmine.createSpy('get').and.returnValue(mockMapPolygon)
            };
            const mockPolygonSeries = {
                getDataItemById: jasmine.createSpy('getDataItemById').and.returnValue(mockPolygonItem)
            };
            component['_polygonSeries'] = mockPolygonSeries;

            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            component['_setActive']('IT');

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });

    describe('__onDestroy', () => {
        it('should call dispose on root when defined', () => {
            const mockRoot = {
                dispose: jasmine.createSpy('dispose')
            };
            component['_root'] = mockRoot;

            component['__onDestroy']();

            expect(mockRoot.dispose).toHaveBeenCalled();
        });

        it('should not throw error when root is undefined', () => {
            component['_root'] = undefined;

            expect(() => {
                component['__onDestroy']();
            }).not.toThrow();
        });

        it('should not throw error when root is null', () => {
            component['_root'] = null;

            expect(() => {
                component['__onDestroy']();
            }).not.toThrow();
        });
    });

    describe('_synchroWithIsActiveQueryParams', () => {
        it('should subscribe to synchronization observable', fakeAsync(() => {
            const key = 'testKey';
            const mockObservable = new Subject<string | undefined>();
            mockQueryParamsService.synchronize.and.returnValue(mockObservable);

            const subscription = component['_synchroWithIsActiveQueryParams'](key);
            tick();

            expect(subscription).toBeDefined();
            expect(mockQueryParamsService.synchronize).toHaveBeenCalled();
        }));

        it('should pass correct parameters to synchronize', () => {
            const key = 'countryCode';
            mockQueryParamsService.synchronize.and.returnValue(of(undefined));

            component['_synchroWithIsActiveQueryParams'](key);

            expect(mockQueryParamsService.synchronize).toHaveBeenCalledWith(
                'countryCode',
                component['__preselectCountry$'],
                jasmine.any(Function)
            );
        });
    });

    describe('Component lifecycle', () => {
        it('should extend ATemplateComponent', () => {
            expect(component['pipeTakeUntil']).toBeDefined();
        });

        it('should clean up on destroy', () => {
            const mockRoot = {
                dispose: jasmine.createSpy('dispose')
            };
            component['_root'] = mockRoot;

            fixture.destroy();

            expect(mockRoot.dispose).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle rapid data updates', fakeAsync(() => {
            const emittedDataSets: WorldMapData[][] = [];
            component['_dataSubject'].subscribe(data => {
                emittedDataSets.push(data as WorldMapData[]);
            });

            fixture.componentRef.setInput('data', [{ id: 'US', value: 1 }]);
            tick(10);
            fixture.componentRef.setInput('data', [{ id: 'FR', value: 2 }]);
            tick(10);
            fixture.componentRef.setInput('data', [{ id: 'DE', value: 3 }]);
            tick(10);

            expect(emittedDataSets.length).toBeGreaterThan(2);
        }));

        it('should handle data with missing properties', fakeAsync(() => {
            let emittedData: Partial<WorldMapData>[] = [];
            component['_dataSubject'].subscribe(data => {
                emittedData = data as Partial<WorldMapData>[];
            });

            const incompleteData: Partial<WorldMapData>[] = [
                { id: 'US' }, // missing value
                { value: 100 }, // missing id
                {} // empty object
            ];
            fixture.componentRef.setInput('data', incompleteData);
            tick();

            expect(emittedData).toEqual(incompleteData);
        }));

        it('should handle very large datasets', fakeAsync(() => {
            let emittedData: WorldMapData[] = [];
            component['_dataSubject'].subscribe(data => {
                emittedData = data as WorldMapData[];
            });

            const largeDataset = Array.from({ length: 200 }, (_, i) => ({
                id: `COUNTRY_${i}`,
                value: Math.random() * 100
            }));

            fixture.componentRef.setInput('data', largeDataset);
            tick();

            expect(emittedData.length).toBe(200);
        }));

        it('should call _setActive for multiple country codes', fakeAsync(() => {
            // Mock _polygonSeries pour que _setActive fonctionne
            const mockMapPolygon = {
                set: jasmine.createSpy('set')
            };
            const mockPolygonItem = {
                get: jasmine.createSpy('get').and.returnValue(mockMapPolygon)
            };
            const mockPolygonSeries = {
                getDataItemById: jasmine.createSpy('getDataItemById').and.returnValue(mockPolygonItem)
            };
            component['_polygonSeries'] = mockPolygonSeries;

            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            const specialCodes = ['US', 'GB', 'FR'];

            specialCodes.forEach(code => {
                component['_setActive'](code);
            });
            tick();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
            expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(specialCodes.length);
        }));

        it('should emit different values on __preselectCountry$ subject', fakeAsync(() => {
            const emittedValues: (string | undefined)[] = [];
            component['__preselectCountry$'].subscribe(value => {
                emittedValues.push(value);
            });

            const countryCodes = ['US', 'GB', 'FR', 'DE', 'JP'];

            countryCodes.forEach(code => {
                component['__preselectCountry$'].next(code);
            });
            tick();

            countryCodes.forEach(code => {
                expect(emittedValues).toContain(code);
            });
        }));
    });

    describe('Integration with query params', () => {
        it('should update preselected country when query param changes', fakeAsync(() => {
            let capturedReaction: ((country: string) => void) | undefined;
            mockQueryParamsService.synchronize.and.callFake((_key: string, _subject: unknown, reaction: (country: string) => void) => {
                capturedReaction = reaction;
                return of(undefined);
            });

            fixture.componentRef.setInput('isActiveParamKey', 'selectedCountry');
            tick();

            const preselectValues: (string | undefined)[] = [];
            component['__preselectCountry$'].subscribe(value => {
                preselectValues.push(value);
            });

            capturedReaction?.('US');
            tick();
            capturedReaction?.('FR');
            tick();
            capturedReaction?.('DE');
            tick();

            expect(preselectValues).toContain('US');
            expect(preselectValues).toContain('FR');
            expect(preselectValues).toContain('DE');
        }));
    });
});
