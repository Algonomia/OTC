import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NgClass, NgStyle, UpperCasePipe} from '@angular/common';
import {CountriesService} from '../../../global-services/countries.service';
import {LanguagesUtils} from '@algonomia/ts-shared';
import {TranslateService} from '@ngx-translate/core';
import {ATemplateComponent} from '../../../templates/template-component.abstract';

@Component({
    selector: 'app-country-flag',
    imports: [
        NgClass,
        NgStyle,
        UpperCasePipe
    ],
    templateUrl: './country-flag.component.html',
    styleUrl: './country-flag.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountryFlagComponent extends ATemplateComponent implements OnInit {
    @Input() set iso2(iso2: string) {
        this.__iso2 = iso2;
        this.__countryClass = 'fi-' + iso2?.toLowerCase();
        this._setDisplay();
    }
    @Input() hideNameMobile: boolean = false;
    @Input() rounded: boolean = false;
    @Input() size_rem?: number;
    @Input() display: '' | 'name' | 'iso2' | 'lang' = '';

    __countryClass = '';
    __name = '';
    __iso2 = '';
    __lang = '';

    private _setDisplay() {
        this.__lang = LanguagesUtils.getLanguageName(this.__iso2.toLowerCase(), this._translate.currentLang)
        this.__name = CountriesService.getName(this.__iso2, this._translate.currentLang);
        this._cd.markForCheck();
    }

    constructor(private _cd: ChangeDetectorRef, private _translate: TranslateService) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this._translate.onLangChange).subscribe(() => {
            this._setDisplay();
        });
    }
}
