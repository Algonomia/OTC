import { Injectable } from '@angular/core';
import {
    CreateFileSourceDTO,
    CreateLinkSourceDTO,
    TCreateFileSources,
    TCreateLinkSources,
    TSourceView,
    SourceViewDTO
} from '@otc/domain';
import {HttpClient} from '@angular/common/http';
import {GlobalEnvironment} from '../../../../environments/otc-env';
import {firstValueFrom, startWith, Subject, switchMap} from 'rxjs';
import {FormDataUtils, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {fromPromise} from 'rxjs/internal/observable/innerFrom';

@Injectable({
  providedIn: 'root'
})
export class SourceFetcherService {
    private _updated$ = new Subject<number[]>();
    private readonly _dto = new SourceViewDTO();

    constructor(private http: HttpClient) {}

    fetchAll$() {
        return this._updated$.pipe(
            startWith(null),
            switchMap(_ => fromPromise(this.fetchAll()))
        );
    }

    async fetchAll() {
        return this._fetch('all');
    }

    async fetchComplete() {
        return this._fetch('validated');
    }

    private async _fetch(subUri: string) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/${subUri}`;
        const sources = await firstValueFrom(this.http.get<TSourceView[]>(baseUrl, { withCredentials: true }));
        return this._dto.toFront(sources);
    }

    canManageSources() {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/is_source_manager`;
        return firstValueFrom(this.http.get<boolean>(baseUrl, { withCredentials: true }));
    }

    async createLinkSource(source: TCreateLinkSources) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/link`;
        const httpSource = new CreateLinkSourceDTO().toBack([source])[0];
        const validatedSources = await firstValueFrom(this.http.post(baseUrl, httpSource, { withCredentials: true }));
        this._updated$.next([]);
        return validatedSources;
    }

    async createFileSource(source: TCreateFileSources) {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/files`;
        const httpSource = new CreateFileSourceDTO().toBack([source])[0];
        const sourceFormData = FormDataUtils.toFormData(httpSource);
        const validatedSources = await firstValueFrom(this.http.post(baseUrl, sourceFormData, { withCredentials: true }));
        this._updated$.next([]);
        return validatedSources;
    }

    async validateSource(id: number, comment: string = '') {
        if (isNullOrUndefined(id)) {
            return;
        }
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/validate`;
        return firstValueFrom(this.http.post(baseUrl, {id: id, comment: comment}, { withCredentials: true })).then(() => {
            this._updated$.next([]);
        });
    }

    async rejectSource(id: number, comment: string = '') {
        if (isNullOrUndefined(id)) {
            return;
        }
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._dto.uri}/reject`;
        return firstValueFrom(this.http.post(baseUrl, {id: id, comment: comment}, { withCredentials: true })).then(() => {
            this._updated$.next([]);
        });
    }
}
