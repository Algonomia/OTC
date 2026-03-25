import { Injectable } from '@angular/core';
import { GlobalEnvironment } from '../../../environments/otc-env';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
    IBackApiAccessPublicInfoAndSecret,
    IBackApiAccessPublicInfo, IFrontApiAccessPublicInfo, IFrontApiAccessPublicInfoAndSecret,
    AccessTokenDTO, AccessTokenAndSecretDTO
} from '@otc/domain';

@Injectable({
    providedIn: 'root'
})
export class AccessTokenFetcherService {
    private readonly _apiUrl = GlobalEnvironment.apiUrl;
    private _tokensSubject = new BehaviorSubject<IFrontApiAccessPublicInfo[]>([]);
    private _accessTokenDTO = new AccessTokenDTO();
    private _accessTokenAndSecretDTO = new AccessTokenAndSecretDTO();

    get tokens$(): Observable<IFrontApiAccessPublicInfo[]> {
        return this._tokensSubject.asObservable();
    }

    constructor(private http: HttpClient) {}

    async loadTokens(): Promise<void> {
        try {
            const baseUrl = `${this._apiUrl}access_token/all`;
            const backTokens = await firstValueFrom(this.http.get<IBackApiAccessPublicInfo[]>(baseUrl, { withCredentials: true }));
            const tokens = this._accessTokenDTO.toFront(backTokens);
            this._tokensSubject.next(tokens);
        } catch (error) {
            console.error('Error loading tokens:', error);
            throw error;
        }
    }

    async createToken(expires_at: Date): Promise<IFrontApiAccessPublicInfoAndSecret> {
        try {
            const baseUrl = `${this._apiUrl}access_token/create`;
            const newBackToken = await firstValueFrom(
                this.http.post<IBackApiAccessPublicInfoAndSecret>(baseUrl, { expires_at_ms: expires_at.getTime() }, { withCredentials: true })
            );
            const newToken = this._accessTokenAndSecretDTO.toFront([newBackToken])[0];

            const current = this._tokensSubject.value;
            this._tokensSubject.next([...current, newToken]);

            return newToken;
        } catch (error) {
            console.error('Error creating token:', error);
            throw error;
        }
    }

    async removeTokens(keys: string[]): Promise<void> {
        try {
            const baseUrl = `${this._apiUrl}access_token/delete`;
            const deletedKeys = await firstValueFrom(
                this.http.post<string[]>(baseUrl, { keys }, { withCredentials: true })
            );

            const tokens_remaining = this._tokensSubject.value.filter(t => !deletedKeys.includes(t.access_key));
            this._tokensSubject.next(tokens_remaining);
        } catch (error) {
            console.error('Error while deleting tokens:', error);
            throw error;
        }
    }
}
