import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {EdgePopoverComponent} from '../../plugs/edge-popover/edge-popover.component';
import {TranslateService} from '@ngx-translate/core';
import {CountryFlagComponent} from '../../design-elements/flags/country-flag/country-flag.component';
import {ATemplateComponent} from '../../templates/template-component.abstract';

@Component({
    selector: 'app-lang-selector',
    imports: [
        EdgePopoverComponent,
        CountryFlagComponent
    ],
    templateUrl: './lang-selector.component.html',
    styleUrl: './lang-selector.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LangSelectorComponent extends ATemplateComponent implements OnInit {
    __currentLang = '';

    constructor(public translate: TranslateService, private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this._watchUpdateCurrentLang();
    }

    private _watchUpdateCurrentLang() {
        this.__currentLang = this.translate.currentLang ?? this.translate.defaultLang ?? 'en';
        this._cd.markForCheck();
        this.pipeTakeUntil(this.translate.onLangChange).subscribe(_ => {
            this.__currentLang = this.translate.currentLang ?? this.translate.defaultLang ?? 'en';
            this._cd.markForCheck();
        })
    }
}
