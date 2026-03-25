import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit,} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ATemplateComponent, ITitleText, TitleTextSliderComponent} from '@algonomia/angular-sdk';
import {HttpClient} from '@angular/common/http';
import {NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Component({
    selector: 'app-faq',
    imports: [
        TranslatePipe,
        TitleTextSliderComponent,
    ],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent extends ATemplateComponent implements OnInit {
    public faq!: ITitleText[];

    constructor(
        private _translate: TranslateService,
        private _httpClient: HttpClient,
        private _cd: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this._translate.onLangChange).subscribe(() => {
            this._changeLanguage(this._translate.currentLang);
        });
        this._changeLanguage(this._translate.currentLang);
    }

    private async _changeLanguage(lang: string) {
        if (isNullOrUndefined(lang)) {
            lang = 'en';
        }

        const json = await import(`./json/${lang}.json`);
        this.faq = json.default;
        this._cd.markForCheck();
    }
}
