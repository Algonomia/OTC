import { Injectable } from '@angular/core';
import {GlobalEnvironment} from '../../../environments/otc-env';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ICountryBadge} from '@otc/domain';

@Injectable({
  providedIn: 'root'
})
export class CompletionFetcherService {

    constructor(private http: HttpClient) {}

    private _base_uri = 'completion';
    private _country_completion_uri = `${this._base_uri}/countries`;
    getCountryBadges() {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._country_completion_uri}`;
        return firstValueFrom(this.http.get<ICountryBadge[]>(baseUrl, { withCredentials: true }));
    }

    private _overall_completion_uri = `${this._base_uri}/overall`;
    getOverallCompletion() {
        const apiUrl = GlobalEnvironment.apiUrl;
        const baseUrl = `${apiUrl}${this._overall_completion_uri}`;
        return firstValueFrom(this.http.get<number>(baseUrl, { withCredentials: true }));
    }
}
