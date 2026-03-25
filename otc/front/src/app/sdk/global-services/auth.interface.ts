import {TUser, TPartialUserManualUpdate} from "@otc/domain";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, firstValueFrom, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { GlobalEnvironment } from '../../../environments/otc-env';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import {Router} from '@angular/router';

export enum UserStatus {
    LOADING,
    DISCONNECTED,
    Registered,
    CGU,
    PROFILE,
    CONNECTED
}

export abstract class AuthProvider {
    private readonly _profileUrl = `${GlobalEnvironment.apiUrl}auth/profile`;
    private readonly _acceptCGUUrl = `${GlobalEnvironment.apiUrl}auth/acceptCGU`;
    private readonly _statusUrl = `${GlobalEnvironment.apiUrl}auth/status`;
    private readonly _logoutUrl = `${GlobalEnvironment.apiUrl}auth/logout`;
    private _userStatus$: BehaviorSubject<UserStatus> = new BehaviorSubject<UserStatus>(UserStatus.LOADING);

    constructor(
        private readonly _http: HttpClient,
        private readonly _router: Router
    ) {
        this._initAuthStatus()
    }

    private async _initAuthStatus() {
        const checkAuthRequest = this._http.get<{ authenticated: boolean }>(this._statusUrl, { withCredentials: true }).pipe(
            map(response => response.authenticated),
            catchError(() => of(false)),
        );
        const isAuthenticated = await firstValueFrom(checkAuthRequest);
        const status = isAuthenticated ? UserStatus.Registered : UserStatus.DISCONNECTED;
        this._userStatus$.next(status);
    }

    async acceptCGU() {
        if (this._userStatus$.getValue() !== UserStatus.CGU) {
            return;
        }
        const acceptCGURequest = this._http.post<TUser>(this._acceptCGUUrl, {}, { withCredentials: true });
        const user = await firstValueFrom(acceptCGURequest);
        this._updateUserStatus(user);
    }

    private _userStatusConnectionState: {[key in UserStatus]: boolean} = {
        [UserStatus.LOADING]: false,
        [UserStatus.DISCONNECTED]: false,
        [UserStatus.Registered]: true,
        [UserStatus.CGU]: true,
        [UserStatus.PROFILE]: true,
        [UserStatus.CONNECTED]: true,
    }
    get isConnected(): boolean {
        const status = this._userStatus$.getValue();
        return this._userStatusConnectionState[status];
    }

    get isConnected$(): Observable<boolean> {
        return this.userStatus$.pipe(
            filter(x => x !== UserStatus.LOADING),
            map(x => this._userStatusConnectionState[x])
        );
    }

    get userStatus$(): Observable<UserStatus> {
        return this._userStatus$.pipe(distinctUntilChanged());
    }

    get getUserInfo$(): Observable<TUser | undefined> {
        return this.isConnected$.pipe(switchMap(isConnected => {
            if (!isConnected) {
                return of(undefined);
            }
            return fromPromise(firstValueFrom(this._http.get<TUser>(this._profileUrl, { withCredentials: true }).pipe(
                catchError(err => {
                    this.disconnect();
                    throw err;
                }),
                tap((user: TUser) => {
                    this._updateUserStatus(user);
                })
            )));
        }));
    }

    updateUserInfo(user: Partial<TPartialUserManualUpdate>) {
        firstValueFrom(this._http.post<TUser>(this._profileUrl, user, { withCredentials: true })).then(
            user => this._updateUserStatus(user)
        );
    }

    private _updateUserStatus(user: TUser) {
        if (!user.cgu) {
            this._userStatus$.next(UserStatus.CGU);
        } else if (!user.job || !user.phone || !user.company || !user.pro_email) {
            this._userStatus$.next(UserStatus.PROFILE);
        } else {
            this._userStatus$.next(UserStatus.CONNECTED);
        }
    }

    async disconnect() {
        const disconnectRequst = this._http.post(this._logoutUrl, {}, { withCredentials: true }).pipe(
            catchError(() => of(null))
        );
        await firstValueFrom(disconnectRequst);

        this._router.navigate(['/']);
        this._userStatus$.next(UserStatus.DISCONNECTED);
    }

    abstract connect(): void;
}
