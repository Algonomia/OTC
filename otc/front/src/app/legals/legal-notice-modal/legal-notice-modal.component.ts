import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {AccordionItemComponent, ATemplateComponent, LangSelectorComponent} from '@algonomia/angular-sdk';

export interface LegalNoticeInterface {
    title: string;
    text: string[] | string[][];
}

@Component({
    selector: 'app-legal-notice-modal',
    templateUrl: './legal-notice-modal.component.html',
    styleUrl: './legal-notice-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        AccordionItemComponent,
        LangSelectorComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalNoticeModalComponent extends ATemplateComponent implements OnInit {
    public legalNotice!: LegalNoticeInterface[];

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
        this.legalNotice = json.default;
        this._cd.markForCheck();
    }

    public isString(variable: any) {
        return ((typeof variable) === 'string');
    }
}
