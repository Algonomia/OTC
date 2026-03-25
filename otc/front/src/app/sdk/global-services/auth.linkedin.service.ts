import { Injectable } from '@angular/core';
import { AuthProvider } from './auth.interface';
import { HttpClient } from '@angular/common/http';
import { GlobalEnvironment } from '../../../environments/otc-env';
import { WindowStrategyService } from '@algonomia/angular-sdk';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthLinkedinService extends AuthProvider {
    private readonly authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${GlobalEnvironment.linkedinClientId}&redirect_uri=${GlobalEnvironment.linkedinRedirectUri}&scope=openid%20profile%20email&prompt=login`;

    constructor(_http: HttpClient, _router: Router) {
        super(_http, _router);
    }

    connect(): void {
        window.location.href = this.authorizationUrl;
    }

    private _logoutWidth = 600;
    private _logoutHeight = 500;
    private _logoutTimeout = 3000;
    override async disconnect() {
        const win = WindowStrategyService.openPopupWindowCentered('https://www.linkedin.com/m/logout', '_blank', this._logoutWidth, this._logoutHeight);

        setTimeout(() => {
            WindowStrategyService.closeWindow(win);
            super.disconnect();
        }, this._logoutTimeout);
    }
}
