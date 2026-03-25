import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {ATemplateComponent, ButtonMainActionComponent, LangSelectorComponent} from '@algonomia/angular-sdk';
import {AuthLinkedinService} from '../../sdk/global-services/auth.linkedin.service';

export interface CGUSection {
    title: string;
    text?: string[] | string[][];
    subsection?: CGUSection[];
}

@Component({
    selector: 'app-cgu-modal',
    templateUrl: './cgu-modal.component.html',
    styleUrl: './cgu-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        ButtonMainActionComponent,
        LangSelectorComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CguModalComponent extends ATemplateComponent implements OnInit {
    public cgu!: CGUSection[];

    constructor(
        private _translate: TranslateService,
        private _httpClient: HttpClient,
        private _cd: ChangeDetectorRef,
        private _authLinkedinService: AuthLinkedinService
    ) {
        super();
    }

    ngOnInit() {
        this._changeLanguage(this._translate.currentLang);
        this.pipeTakeUntil(this._translate.onLangChange).subscribe(() => {
            this._changeLanguage(this._translate.currentLang);
        });
    }

    private async _changeLanguage(lang: string) {
        if (isNullOrUndefined(lang)) {
            lang = 'en';
        }

        const json = await import(`./json/${lang}.json`);
        this.cgu = json.default;
        this._cd.markForCheck();
    }

    public isString(variable: any) {
        return ((typeof variable) === 'string');
    }

    public acceptCGU() {
        this._authLinkedinService.acceptCGU();
    }
}
