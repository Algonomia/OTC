import { InjectionToken } from '@angular/core';

export interface AlgonomiaSdkConfig {
    apiUrl: string;
    siteUrl: string;
    linkedinClientId: string;
    linkedinRedirectUri: string;
    production: boolean;
    siteName: string;
}

export const ALGONOMIA_SDK_CONFIG = new InjectionToken<AlgonomiaSdkConfig>('ALGONOMIA_SDK_CONFIG');
