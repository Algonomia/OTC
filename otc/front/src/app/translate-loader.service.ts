import enTranslations from '../assets/i18n/en.json';
import frTranslations from '../assets/i18n/fr.json';
import {Injectable} from '@angular/core';
import {TranslateLoader} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';

@Injectable()
export class JsonFileLoader implements TranslateLoader {
    private translations: { [key: string]: any } = {
        'en': enTranslations,
        'fr': frTranslations
    };

    getTranslation(lang: string): Observable<any> {
        const translation = this.translations[lang];

        if (translation) {
            return of(translation);
        }

        return of({});
    }
}
