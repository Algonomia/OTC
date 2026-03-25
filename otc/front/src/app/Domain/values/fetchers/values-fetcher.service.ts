import {Injectable} from '@angular/core';
import {
    TDatumFullHistoryView,
    TDatumFullHistoryViewExt,
    FilterValuesDTO,
    IFilterValuesUI,
    TOTCCreateDatum, IOTCDatumId, IOTCRate,
    ISubmitRate, TFullSubmitRate,
    OTCSegmentLinesByCountry, TValueLine, TOTCHistorySegment, TDatumFullContributionViewExt,
    CreateOtcFullContributionView, TDatumFullContributionView
} from '@otc/domain';
import {firstValueFrom, startWith, Subject, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {GlobalEnvironment} from '../../../../environments/otc-env';
import {NullUndefinedUtils, NumberUtils} from '@algonomia/ts-shared';
import {CreateOtcFullHistoryView} from '@otc/domain';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Injectable({
  providedIn: 'root'
})
export class ValuesFetcherService {
    private _updated$ = new Subject<number[]>();
    private readonly _filterDTO = new FilterValuesDTO();
    private _cacheDueDatesByCountry = new Map<string, [string, TValueLine[]][]>();
    private _cacheValues = new Map<string, TValueLine[]>();

    constructor(private http: HttpClient) {}

    fetch$(params: IFilterValuesUI) {
        return this._updated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchWithCache(params, true)))
        );
    }

    fetchValuesByCountry$(params: IFilterValuesUI) {
        return this._updated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchValuesByCountryWithCache(params, true)))
        );
    }

    async fetchValuesByCountryWithCache(params: IFilterValuesUI, force = false) {
        const cacheKey = JSON.stringify(params);
        if (!this._cacheDueDatesByCountry.has(cacheKey) || force) {
            this._cacheDueDatesByCountry.set(cacheKey, await this._fetchValuesByCountry(params));
        }
        return this._cacheDueDatesByCountry.get(cacheKey) ?? [];
    }

    private async _fetchValuesByCountry(params: IFilterValuesUI) {
        const lines = await this.fetchWithCache(params);
        return OTCSegmentLinesByCountry.toCountrySegmentation(lines);
    }

    async fetchWithCache(params: IFilterValuesUI, force = false) {
        const cacheKey = JSON.stringify(params);
        if (!this._cacheValues.has(cacheKey) || force) {
            this._cacheValues.set(cacheKey, await this.fetch(params));
        }
        return this._cacheValues.get(cacheKey) ?? [];
    }

    private _lines_uri = 'lines'
    async fetch(params: IFilterValuesUI) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._lines_uri}`;
        const backParams = this._filterDTO.toBack([params])[0];
        return firstValueFrom(this.http.post<TValueLine[]>(baseUrl, backParams, { withCredentials: true }));
    }

    private _base_uri = 'values';
    private _is_values_manager_uri = `${this._base_uri}/is_values_manager`;
    canManageValues() {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._is_values_manager_uri}`;
        return firstValueFrom(this.http.get<boolean>(baseUrl, { withCredentials: true }));
    }

    private _suggest_value_uri = `${this._base_uri}/suggestValue`;
    async post(datums: TOTCCreateDatum[]) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._suggest_value_uri}`;
        const validatedDatums = await firstValueFrom(this.http.post(baseUrl, datums, { withCredentials: true }));
        this._contributionsUpdated$.next([]);
        return validatedDatums;
    }

    private _historyUpdated$ = new Subject<number[]>();
    private _cacheHistory = new Map<string, TDatumFullHistoryViewExt[]>();
    fetchHistory$(valueSegment: TOTCHistorySegment) {
        return this._historyUpdated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchCacheHistory(valueSegment, true)))
        );
    }
    async fetchCacheHistory(valueSegment: TOTCHistorySegment, force = false) {
        const id = JSON.stringify(valueSegment);
        if (!this._cacheHistory.has(id) || force) {
            this._cacheHistory.set(id, await this.getDatumHistory(valueSegment));
        }
        return this._cacheHistory.get(id);
    }
    private _history_uri = `${this._base_uri}/history`
    async getDatumHistory(valueSegment: TOTCHistorySegment) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._history_uri}`;
        const historyFullViews = await firstValueFrom(
            this.http.post<TDatumFullHistoryView[]>(baseUrl, valueSegment, { withCredentials: true })
        );
        return CreateOtcFullHistoryView.toFront(historyFullViews)
    }

    private _contributionsUpdated$ = new Subject<number[]>();
    private _cacheContributions: TDatumFullContributionViewExt[] = [];
    fetchContributions$() {
        return this._contributionsUpdated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchCacheContributions(true)))
        );
    }
    async fetchCacheContributions(force = false) {
        if (!this._cacheContributions || force) {
            this._cacheContributions = await this.getDatumContributions();
        }
        return this._cacheContributions;
    }
    private _contributions_uri = `${this._base_uri}/contributions`
    async getDatumContributions() {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._contributions_uri}`;
        const contributionsFullViews = await firstValueFrom(
            this.http.get<TDatumFullContributionView[]>(baseUrl, { withCredentials: true })
        );
        return CreateOtcFullContributionView.toFront(contributionsFullViews)
    }

    private _ratesUpdated$ = new Subject<number[]>();
    private _cacheRates = new Map<string, IOTCRate[]>();
    fetchRates$(valueSegment: IOTCDatumId) {
        return this._ratesUpdated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchCacheRates(valueSegment, true)))
        );
    }
    async fetchCacheRates(otcDatumId: IOTCDatumId, force = false) {
        const id = JSON.stringify(otcDatumId);
        if (!this._cacheRates.has(id) || force) {
            this._cacheRates.set(id, await this.getRates(otcDatumId));
        }
        return this._cacheRates.get(id);
    }
    private _rates_uri = `${this._base_uri}/rates`
    getRates(otcDatumId: IOTCDatumId) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._rates_uri}`;
        return firstValueFrom(
            this.http.post<IOTCRate[]>(baseUrl, otcDatumId, { withCredentials: true })
        );
    }

    private _current_user_rates_uri = `${this._base_uri}/currentUserRate`
    async getCurrentUserRate(otcDatumId: IOTCDatumId) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._current_user_rates_uri}`;
        return firstValueFrom(
            this.http.post<ISubmitRate | null>(baseUrl, otcDatumId, { withCredentials: true })
        );
    }

    private _submit_rates_uri = `${this._base_uri}/submitRate`
    async submitRate(rate: TFullSubmitRate) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._submit_rates_uri}`;
        await firstValueFrom(
            this.http.post(baseUrl, rate, { withCredentials: true })
        );
        this._historyUpdated$.next([]);
        this._ratesUpdated$.next([]);
    }

    private _validate_uri = `${this._base_uri}/validate`
    async validateValue(id: number, comment: string = '') {
        if (isNullOrUndefined(id)) {
            return;
        }
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._validate_uri}`;
        return firstValueFrom(this.http.post(baseUrl, {id: id, comment: comment}, { withCredentials: true })).then(() => {
            this._updated$.next([]);
            this._contributionsUpdated$.next([]);
        });
    }

    private _reject_uri = `${this._base_uri}/reject`
    async rejectValue(id: number, comment: string = '') {
        if (isNullOrUndefined(id)) {
            return;
        }
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._reject_uri}`;
        return firstValueFrom(this.http.post(baseUrl, {id: id, comment: comment}, { withCredentials: true })).then(() => {
            this._updated$.next([]);
            this._contributionsUpdated$.next([]);
        });
    }
}
