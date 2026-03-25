import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {ValuesFetcherService} from '../../Domain/values/fetchers/values-fetcher.service';
import {IndicatorColumns} from '../../Domain/values/columns/indicators.columns';
import {
    IFilterValuesUI,
    TSourceViewExt,
    TValueLine,
    ObligationType, EObligationTypeId,
    OtcFullLineCompletion
} from '@otc/domain';
import {
    AlgoTableColumns,
    AlgoTableComponent,
    ATemplateWithRebootComponent,
    CountriesService,
    IPanel,
    PanelSynchroComponent,
    QueryParamsSynchronizerService,
    ScreenSizeHandlerComponent,
    SelectHandler,
    SpaceLeftComponent,
    StdMenuOverlayAdaptiveComponent,
    ToggleComponent,
    WorldMapComponent
} from '@algonomia/angular-sdk';
import {ArrayUtils, NumberUtils} from '@algonomia/ts-shared';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, combineLatestWith, debounceTime, map, skip, switchMap, tap} from 'rxjs';
import {SourceFetcherService} from '../../Domain/sources/fetchers/source-fetcher.service';
import {JurisdictionCardComponent} from './jurisdiction-card/jurisdiction-card.component';
import {ContributionBarComponent} from '../common/contribution-bar/contribution-bar.component';
import {SegmentationColumns} from '../../Domain/values/columns/segmentation.columns';
import {GlobalFiltersComponent} from './global-filters/global-filters.component';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-dashboards',
    imports: [
        AlgoTableComponent,
        JurisdictionCardComponent,
        PanelSynchroComponent,
        ScreenSizeHandlerComponent,
        WorldMapComponent,
        TranslatePipe,
        ContributionBarComponent,
        SpaceLeftComponent,
        GlobalFiltersComponent,
        StdMenuOverlayAdaptiveComponent,
        ToggleComponent,
        AsyncPipe
    ],
    templateUrl: './dashboards.component.html',
    styleUrl: './dashboards.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsComponent extends ATemplateWithRebootComponent implements OnInit, AfterViewInit {
    readonly __MAP_ACTIVE_ISO2_KEY = 'country1';
    readonly __CARD_ACTIVE_ISO2_KEY = 'country2';
    readonly __CARD_ACTIVE_OBLIGATION_KEY = 'obligation2';
    readonly __TABLE_SHOW_NOTES_KEY = 'showNotes';
    readonly __TABLE_SHOW_REFERENCES_KEY = 'showReferences';
    readonly __TABLE_SHOW_SUBOBLIGATIONS_KEY = 'showSubobligations';

    @ViewChild('panelsTpl') panelsTpl!: PanelSynchroComponent;
    @ViewChild('mapTpl') mapTpl!: TemplateRef<unknown>;
    @ViewChild('cardTpl') cardTpl!: TemplateRef<unknown>;
    @ViewChild('cardHeaderTpl') cardHeaderTpl!: TemplateRef<unknown>;
    @ViewChild('tableHeaderTpl') tableHeaderTpl!: TemplateRef<unknown>;
    @ViewChild('tableTpl') tableTpl!: TemplateRef<unknown>;

    getIso2Callback = (x: TValueLine) => x.jurisdiction;

    protected __data: TValueLine[] = [];
    protected __tableData: TValueLine[] = [];
    protected __countryData: [string, TValueLine[]][] = [];
    protected __mapData: {id: string, data: TValueLine[], value: number}[] = [];

    constructor(
        private _valuesFetcherService: ValuesFetcherService,
        private _sourceFetcherService: SourceFetcherService,
        private _queryParamsSynchronizerService: QueryParamsSynchronizerService,
        private _cd: ChangeDetectorRef,
        private _translateService: TranslateService
    ) {
        super();
    }

    isTableExportableCallback(exportLines: any[]) {
        return exportLines.length > 0 && exportLines.every(x => x?.jurisdiction === exportLines[0]?.jurisdiction)
    }

    panels: IPanel[] = [];
    mapPanel?: IPanel;
    cardPanel?: IPanel;
    tablePanel?: IPanel;

    ngAfterViewInit() {
        this.mapPanel = {
            title: 'OTCFront.Dashboard.WorldMap.title',
            info: 'OTCFront.Dashboard.WorldMap.info',
            logo: 'System/Data/Map',
            contentTpl:this.mapTpl,
            defSelected: true
        };
        this.cardPanel = {
            title: 'OTCFront.Dashboard.Card.title',
            info: 'OTCFront.Dashboard.Card.info',
            logo: 'System/Data/Jurisdictions',
            contentTpl:this.cardTpl,
            headerTpl: this.cardHeaderTpl,
            defSelected: false
        };
        this.tablePanel = {
            title: 'OTCFront.Dashboard.table.title',
            info: 'OTCFront.Dashboard.table.info',
            logo: 'System/Data/Table',
            contentTpl:this.tableTpl,
            headerTpl: this.tableHeaderTpl,
            defSelected: true
        };
        this.panels = [this.mapPanel, this.cardPanel, this.tablePanel];
    }

    async ngOnInit() {
        this._updatedData$.subscribe(([sources, data, countryData]) => {
            this.allSources = sources;
            this.__data = data;
            this.__tableData = data;
            this.__countryData = countryData;
            this.__mapData = this.__countryData.map(x => ({
                id: x[0],
                data: x[1],
                value: NumberUtils.toFixedNumber(100 * OtcFullLineCompletion.getCountryCompletion(x[1], x[0]), 2)})
            );
            this.__rebootSubject$.next();
            this._setCardFilters();
            this._onCardCountrySelectedSelectHandler();
            this._onMapCountryActiveOpenCard();
            this._onMapSelectedCountryUpdateCard();
            this._filterTableColumsSubscribes();
            this._filterTableDataSubscribes();
            this._cd.markForCheck();
        });
    }

    protected __filterValuesUI$ = new BehaviorSubject<IFilterValuesUI>({});
    private get _updatedData$() {
        return this.pipeTakeUntil(
            this.__filterValuesUI$.pipe(
                switchMap(_ => this._sourceFetcherService.fetchAll$()),
                combineLatestWith(
                    this.__filterValuesUI$.pipe(switchMap(filters => this._valuesFetcherService.fetch$(filters))),
                    this.__filterValuesUI$.pipe(switchMap(filters => this._valuesFetcherService.fetchValuesByCountry$(filters)))
                )
            )
        ).pipe(debounceTime(200));
    }

    allObligations: EObligationTypeId[] = [];
    obligationsSelectHandler: SelectHandler<EObligationTypeId, EObligationTypeId> = SelectHandler.getAlwaysOneSelectHandler(
        [], [], [], ((x: EObligationTypeId) => x), ((x: EObligationTypeId) => this._translateService.get(ObligationType.getText(x))).bind(this)
    );
    allSources: TSourceViewExt[] = [];
    allCountries: string[] = [];
    countrySelectHandler: SelectHandler<string, string> = SelectHandler.getAlwaysOneSelectHandler(
        [], [], [], ((x: string) => x), ((x: string) => CountriesService.getName(x, this._translateService.currentLang)).bind(this)
    );
    private _setCardFilters() {
        this.allCountries = this.__countryData.map(x => x[0]).sort();
        this.countrySelectHandler.changeList(this.allCountries);
        this.allObligations = ArrayUtils.uniqueValues(this.__data, (x => x?.obligation_type_id)).filter(x => !!x);
        this._listenAllObligations();
        this._synchroCountryFilterWithQueryParams();
        this._synchroObligationFilterWithQueryParams();
    }

    private _listenAllObligations() {
        this.pipeTakeUntilOrReboot(this._queryParamsSynchronizerService.queryListener(this.__CARD_ACTIVE_ISO2_KEY)).subscribe(iso2 => {
            const allObligations = ArrayUtils.uniqueValues(
                this.__data.filter(x => !iso2 || x.jurisdiction === iso2), (x => x?.obligation_type_id)
            ).sort();
            this.obligationsSelectHandler.changeList(allObligations);
        });
    }

    private _synchroCountryFilterWithQueryParams() {
        const selectedIsoSubject = this.pipeTakeUntilOrReboot(this.countrySelectHandler.selected$).pipe(map(values => {
            return values?.at(0);
        }));

        const reaction = ((country: string) => {
            if (!country) {
                this.countrySelectHandler.replaceAll([]);
            } else {
                const lowerCase = country.toLowerCase();
                this.countrySelectHandler.replaceAll(this.allCountries.filter(x => x.toLowerCase() === lowerCase));
            }
        }).bind(this);

        return this.pipeTakeUntil(
            this._queryParamsSynchronizerService.synchronize(this.__CARD_ACTIVE_ISO2_KEY, selectedIsoSubject, reaction)
        ).subscribe();
    }

    private _synchroObligationFilterWithQueryParams() {
        const selectedSubject = this.pipeTakeUntilOrReboot(this.obligationsSelectHandler.selected$).pipe(map(values => {
            return values?.at(0);
        }));

        const reaction = ((obligation: EObligationTypeId) => {
            if (!obligation) {
                this.obligationsSelectHandler.replaceAll([]);
            } else {
                this.obligationsSelectHandler.replaceAll(this.allObligations.filter(x => x === obligation));
            }
        }).bind(this);

        return this.pipeTakeUntilOrReboot(
            this._queryParamsSynchronizerService.synchronize(this.__CARD_ACTIVE_OBLIGATION_KEY, selectedSubject, reaction)
        ).subscribe();
    }

    filteredCardData: TValueLine[] = [];
    private _onCardCountrySelectedSelectHandler() {
        this.pipeTakeUntilOrReboot(this.countrySelectHandler.selected$).pipe(switchMap(countries => {
            return this.obligationsSelectHandler.selected$.pipe(map(obligationTypes => {
                return [countries, obligationTypes] as [string[], EObligationTypeId[]];
            }))
        })).subscribe(([countries, obligationTypes]) => {
            const iso2Set = new Set(countries);
            const obligationTypeSet = new Set(obligationTypes);
            this.filteredCardData = this.__data.filter(
                x =>
                    (iso2Set.has(x.jurisdiction) || !iso2Set.size) &&
                    (obligationTypeSet.has(x.obligation_type_id) || !obligationTypeSet.size)
            );
            this._cd.markForCheck();
        });
    }

    private _onMapCountryActiveOpenCard() {
        this.pipeTakeUntilOrReboot(this._queryParamsSynchronizerService.queryListener(this.__MAP_ACTIVE_ISO2_KEY)).subscribe(iso2 => {
            if (!!iso2 && this.cardPanel) {
                this.panelsTpl.select(this.cardPanel);
            }
            this._cd.markForCheck();
        });
    }

    private _onMapSelectedCountryUpdateCard() {
        this.pipeTakeUntilOrReboot(this._queryParamsSynchronizerService.queryListener(this.__MAP_ACTIVE_ISO2_KEY)).pipe(skip(1)).subscribe(iso2 => {
            if (!!iso2) {
                this.countrySelectHandler.addIds([iso2]);
            }
            this._cd.markForCheck();
        });
    }

    protected __subObligationsToggleSubject = new BehaviorSubject<boolean>(false);
    protected __notesToggleSubject = new BehaviorSubject<boolean>(false);
    protected __refsToggleSubject = new BehaviorSubject<boolean>(false);
    protected __updateSubObligationsToggle(value: boolean) {
        this.__subObligationsToggleSubject.next(value);
        this._cd.markForCheck();
    }
    protected __updateNotesToggle(value: boolean) {
        this.__notesToggleSubject.next(value);
        this._cd.markForCheck();
    }
    protected __updateRefsToggle(value: boolean) {
        this.__refsToggleSubject.next(value);
        this._cd.markForCheck();
    }

    protected __otcLineColumns: AlgoTableColumns<TValueLine>[] = [
        ...SegmentationColumns.getAllColumns(),
        ...IndicatorColumns.getAllColumns(true, true, true)
    ];
    protected __tableOtcLineColumns: AlgoTableColumns<TValueLine>[] = [];
    private _filterTableColumsSubscribes() {
        this._linkToggleObserversToUrls(this.__TABLE_SHOW_SUBOBLIGATIONS_KEY, this.__subObligationsToggleSubject);
        this._linkToggleObserversToUrls(this.__TABLE_SHOW_NOTES_KEY, this.__notesToggleSubject);
        this._linkToggleObserversToUrls(this.__TABLE_SHOW_REFERENCES_KEY, this.__refsToggleSubject);

        this.pipeTakeUntilOrReboot(this.__subObligationsToggleSubject).pipe(
            combineLatestWith(this.__notesToggleSubject, this.__refsToggleSubject)
        ).subscribe(([showSubObligations, showNotes, showReferences]) => {
            this.__tableOtcLineColumns = [
                ...SegmentationColumns.getAllColumns(),
                ...IndicatorColumns.getAllColumns(showSubObligations, showNotes, showReferences)
            ];
            this._cd.markForCheck();
        });
    }

    private _linkToggleObserversToUrls(urlKey: string, subject: BehaviorSubject<boolean>) {
        const reaction = ((value: string) => {
            if (value === 'yes') {
                subject.next(true);
            } else {
                subject.next(false);
            }
        }).bind(this);
        return this.pipeTakeUntilOrReboot(
            this._queryParamsSynchronizerService.synchronize(
                urlKey, subject.pipe(map(x => x ? 'yes' : undefined)
            ), reaction)
        ).subscribe();
    }

    filteredTableData: TValueLine[] = [];
    private _filterTableDataSubscribes() {
        this.pipeTakeUntilOrReboot(this._queryParamsSynchronizerService.queryListener(this.__MAP_ACTIVE_ISO2_KEY)).subscribe(iso2 => {
            if (!iso2) {
                this.filteredTableData = this.__tableData;
            } else {
                this.filteredTableData = this.__tableData.filter(x => x.jurisdiction === iso2);
            }
            this._cd.markForCheck();
        });
    }
}
