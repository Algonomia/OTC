import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {TDatumFullHistoryViewExt, IOTCDatumId, IOTCRate, TOTCHistorySegment, ObligationType} from '@otc/domain';
import {AppInjector} from '../../../injector';
import {
    AlgoTableColumns,
    AlgoTableComponent,
    ATemplateComponent,
    CardComponent,
    DisplayRateAsStarsComponent,
    JurisdictionFlagLabelComponent,
    ModalService
} from '@algonomia/angular-sdk';
import {HistoryViewColumns} from '../columns/view_history.columns';
import {ValuesFetcherService} from '../fetchers/values-fetcher.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RateColumns} from '../../rate/columns/rate.columns';
import {BehaviorSubject, of, switchMap} from 'rxjs';
import {AsyncPipe, DatePipe} from '@angular/common';
import {SourceProvenanceColumns} from '../../sources/columns/source-provenance-columns';
import {SourceMediumColumns} from '../../sources/columns/source-medium-columns';
import {IndicatorColumns} from '../columns/indicators.columns';
import {RateOtcValueColumns} from '../../rate/columns/add-rate-columns';

@Component({
    selector: 'app-history-modal',
    imports: [
        AlgoTableComponent,
        CardComponent,
        TranslatePipe,
        DisplayRateAsStarsComponent,
        AsyncPipe,
        DatePipe,
        JurisdictionFlagLabelComponent
    ],
    templateUrl: './history-modal.component.html',
    styleUrl: './history-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class HistoryModalComponent extends ATemplateComponent implements OnInit {
    static open(valueSegment?: TOTCHistorySegment) {
        const modalService = AppInjector.get(ModalService);
        const translateService = AppInjector.get(TranslateService);
        const title = translateService.instant('OTCFront.HistoryView.modal_title');
        modalService.open(HistoryModalComponent, 'large', { valueSegment: valueSegment }, title);
    }

    @Input() valueSegment!: TOTCHistorySegment;

    protected __historyData: TDatumFullHistoryViewExt[] = [];
    protected __historyColumns: AlgoTableColumns<TDatumFullHistoryViewExt>[] = [];
    protected __rateData: IOTCRate[] = [];
    protected __obligationTypeText = '';
    protected __rateColumns: AlgoTableColumns<IOTCRate>[] = RateColumns.getNonHeaderColumns();
    protected __datumId$ = new BehaviorSubject<IOTCDatumId | undefined>(undefined);

    constructor(private _valuesFetcherService: ValuesFetcherService, private _cd: ChangeDetectorRef) {
        super();
    }

    async ngOnInit() {
        this.__obligationTypeText = ObligationType.getText(this.valueSegment.obligation_type_id);
        this.pipeTakeUntil(this._valuesFetcherService.fetchHistory$(this.valueSegment)).subscribe(historyData => {
            this.__historyData = historyData ?? [];
            this._cd.markForCheck();
        });
        this.pipeTakeUntil(this.__datumId$).pipe(switchMap(datumId => {
            if (!datumId) {
                return of([]);
            }
            return this._valuesFetcherService.fetchRates$(datumId)
        })).subscribe(rateData => {
            this.__rateData = rateData ?? [];
            this._cd.markForCheck();
        });

        const indicatorColumn = IndicatorColumns.getById(this.valueSegment.key) as IndicatorColumns;
        this.__historyColumns = [
            indicatorColumn.baseColumn,
            ...indicatorColumn.baseSubObligationColumns,
            indicatorColumn.baseNotesColumn,
            indicatorColumn.baseRefsColumn,
            ...HistoryViewColumns.getAllColumns(),
            ...SourceProvenanceColumns.getAllColumns(),
            ...SourceMediumColumns.getAllColumns(),
            RateOtcValueColumns.rateValue
        ] as AlgoTableColumns<TDatumFullHistoryViewExt>[];
        this._cd.markForCheck();
    }

    protected __setDatumIdForRates = (async (d: TDatumFullHistoryViewExt) => {
        this.__datumId$.next({id: d.id, type: d.type});
    }).bind(this);
}
