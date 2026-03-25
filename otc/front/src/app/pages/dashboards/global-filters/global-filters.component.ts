import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input, OnInit,
    Output, TemplateRef,
    ViewChild
} from '@angular/core';
import {
    ATemplateComponent,
    BarComponent,
    ButtonCancelComponent,
    ButtonContinueComponent,
    ButtonResetComponent,
    ButtonTuneComponent,
    LabelCounterComponent,
    MetaFormGroup,
    MetaFormGroupComponent,
    ModalService,
    QueryParamsSynchronizerService
} from '@algonomia/angular-sdk';
import {FormGroup} from '@angular/forms';
import {SourceFetcherService} from '../../../Domain/sources/fetchers/source-fetcher.service';
import {
    EOTCValuePriority,
    getFilterValuesValidator,
    IFilterValuesUI,
    TSourceViewExt, EObligationTypeId
} from '@otc/domain';
import {DateUtils, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {debounceTime, map, Subject} from 'rxjs';

@Component({
    selector: 'app-global-filters',
    imports: [
        BarComponent,
        ButtonCancelComponent,
        ButtonContinueComponent,
        MetaFormGroupComponent,
        LabelCounterComponent,
        ButtonResetComponent,
        ButtonTuneComponent
    ],
    templateUrl: './global-filters.component.html',
    styleUrl: './global-filters.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalFiltersComponent extends ATemplateComponent implements OnInit {
    readonly __GLOBAL_FILTER_URL_KEY = 'filter';

    @Input() currentFilters: IFilterValuesUI = {};
    @ViewChild('modalRef') modalRef!: TemplateRef<unknown>;
    @Output() submitted = new EventEmitter<IFilterValuesUI>();
    protected __filterCounter = 0;

    protected __formGroup!: FormGroup;

    private _askForSubmitSubject = new Subject<IFilterValuesUI>();
    private _completeSources: TSourceViewExt[] = [];

    constructor(
        private _cd: ChangeDetectorRef,
        private _sourceFetcherService: SourceFetcherService,
        private _modalService: ModalService,
        private _queryParamsSynchronizerService: QueryParamsSynchronizerService
    ) {
        super();
        this.pipeTakeUntil(this._askForSubmitSubject).pipe(debounceTime(200)).subscribe(toSubmit => {
            this.submitted.next(toSubmit);
            this.__filterCounter = Array.from(Object.values(toSubmit)).filter(x => !isNullOrUndefined(x)).length;
            this._cd.markForCheck();
        });
    }

    async ngOnInit() {
        this._completeSources = await this._sourceFetcherService.fetchComplete();
        this.__formGroup = MetaFormGroup.createFromValidatorGroup(
            getFilterValuesValidator(this._completeSources),
            this.currentFilters
        );

        // TODO: the following is not robust to change on filters params. Do Something in shared
        this._synchroCountryFilterWithQueryParams();
        this._synchroSourceFilterWithQueryParams();
        this._synchroObligationTypeIdsFilterWithQueryParams();
        this._synchroMinVersionWithQueryParams();
        this._synchroMaxVersionWithQueryParams();
        this._synchroMinReliabilityWithQueryParams();
        this._synchroPriorityWithQueryParams();

        this._cd.markForCheck();
    }

    open() {
        this._modalService.openTemplate(this.modalRef, {}, 'small-full-height');
        this._cd.markForCheck();
    }

    reset() {
        this.__formGroup.setValue({
            minVersion: null,
            maxVersion: null,
            minReliability: null,
            priority: null,
            jurisdictions: null,
            obligationTypeIds: null,
            sources: null
        });
        this._cd.markForCheck();
    }

    submit() {
        this.updateSubmitted();
        this.closeModal();
    }

    public closeModal() {
        this._modalService.close();
    }

    private _synchroCountryFilterWithQueryParams() {
        return this._synchroFilterParam(
            'jurisdictions',
            (arr => arr?.join(',') ?? undefined),
            (s => s?.split(',') ?? undefined),
        )
    }

    private _synchroObligationTypeIdsFilterWithQueryParams() {
        return this._synchroFilterParam(
            'obligationTypeIds',
            (arr => arr?.join(',') ?? undefined),
            (s => s?.split(',') as EObligationTypeId[] ?? undefined),
        )
    }

    private _synchroSourceFilterWithQueryParams() {
        return this._synchroFilterParam(
            'sources',
            (arr => arr?.map(x => x.source_id)?.join(',') ?? undefined),
            ((sourceIdsStr: string | undefined) => {
                const ids = sourceIdsStr?.split(',')?.map(x => parseInt(x)) ?? [];
                return ids.map(
                    id => this._completeSources.find(source => source.source_id === id)
                ).filter(x => !!x)
            }).bind(this),
        )
    }

    private _synchroMinVersionWithQueryParams() {
        return this._synchroFilterParam(
            'minVersion',
            (date => DateUtils.dateToStdString(date)),
            (dateStr: string | undefined) => {
                return DateUtils.stdStringToDate(dateStr)
            },
        )
    }

    private _synchroMaxVersionWithQueryParams() {
        return this._synchroFilterParam(
            'maxVersion',
            (date => DateUtils.dateToStdString(date)),
            (dateStr: string | undefined) => {
                return DateUtils.stdStringToDate(dateStr)
            },
        )
    }

    private _synchroMinReliabilityWithQueryParams() {
        return this._synchroFilterParam(
            'minReliability',
            (n => isNullOrUndefined(n) ? undefined : String(n)),
            (nStr: string | undefined) => {
                return nStr ? parseInt(nStr) : undefined
            },
        )
    }

    private _synchroPriorityWithQueryParams() {
        return this._synchroFilterParam(
            'priority',
            (p => p ?? undefined),
            (str: string | undefined) => {
                return str as EOTCValuePriority;
            },
        )
    }

    private _synchroFilterParam<K extends keyof IFilterValuesUI>(
        key: K,
        toParams: (x: IFilterValuesUI[K]) => string | undefined,
        fromParams: (x: string | undefined) => IFilterValuesUI[K]
    ) {
        const subject = this.pipeTakeUntil(this.submitted).pipe(map((value: IFilterValuesUI) => {
            return toParams(value[key]);
        }));

        const reaction = ((paramValue: string) => {
            if (!paramValue) {
                this.__formGroup.controls[key].setValue(null);
            } else {
                try {
                    const convertedFromParam = fromParams(paramValue)
                    this.__formGroup.controls[key].setValue(convertedFromParam);
                } catch (e) {
                    this.__formGroup.controls[key].setValue(null);
                }
            }
            this.updateSubmitted();
        }).bind(this);

        return this.pipeTakeUntil(
            this._queryParamsSynchronizerService.synchronize(`${this.__GLOBAL_FILTER_URL_KEY}.${key}`, subject, reaction)
        ).subscribe();
    }

    updateSubmitted() {
        const toSubmit = {
            minVersion: this.__formGroup.value.minVersion,
            maxVersion: this.__formGroup.value.maxVersion,
            minReliability: this.__formGroup.value.minReliability,
            priority: this.__formGroup.value.priority,
            jurisdictions: this.__formGroup.value.jurisdictions,
            obligationTypeIds: this.__formGroup.value.obligationTypeIds,
            sources: this.__formGroup.value.sources
        };
        this._askForSubmitSubject.next(toSubmit);
    }
}
