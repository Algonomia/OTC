import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {HttpClient, provideHttpClient} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {provideTranslateService, TranslateLoader} from '@ngx-translate/core';
import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {JsonFileLoader} from './translate-loader.service';
import {ALGONOMIA_SDK_CONFIG} from '@algonomia/angular-sdk';
import {GlobalEnvironment} from '../environments/otc-env';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
        provideTranslateService({
            loader: {
                provide: TranslateLoader,
                useClass: JsonFileLoader,
                deps: [HttpClient],
            }
        }),
        DialogService,
        importProvidersFrom(DynamicDialogModule),
        { provide: ALGONOMIA_SDK_CONFIG, useValue: GlobalEnvironment },
  ]
};
