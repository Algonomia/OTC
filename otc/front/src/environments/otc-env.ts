import { loadEnvironment } from '@algonomia/angular-sdk';

export interface OTCEnvironment {
    production: boolean;
    apiUrl: string;
    siteUrl: string;
    linkedinClientId: string;
    linkedinRedirectUri: string;
    siteName: string;
}

export const { environment: GlobalEnvironment, ready: environmentReady } =
    loadEnvironment<OTCEnvironment>(
        'environments/env.json',
        ['apiUrl', 'linkedinClientId', 'linkedinRedirectUri']
    );
