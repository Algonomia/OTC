import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {map} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {QueryParamsSynchronizerService} from './query-params-synchronizer.service';

@Injectable({
    providedIn: 'root'
})
export class LangHandlerService {

    constructor(public translate: TranslateService, private _queryParamsSynchronizerService: QueryParamsSynchronizerService) {
        this.translate.setDefaultLang('en');
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            this._synchronizeWithURL();
        } else {
            this.translate.use('en');
        }
    }

    readonly __LANG_KEY = 'lang';
    private _synchronizeWithURL() {
        const reaction = ((lang: string) => {
            if (lang) {
                this.translate.use(lang);
            } else {
                this._queryParamsSynchronizerService.updateKey(this.__LANG_KEY, this.translate.currentLang ?? this.translate.defaultLang)
            }
        }).bind(this);

        const subject = this.translate.onLangChange.pipe(
            map(_ => this.translate.currentLang ?? this.translate.defaultLang),
        );

        this._queryParamsSynchronizerService.synchronize(this.__LANG_KEY, subject, reaction).subscribe();
    }
}
