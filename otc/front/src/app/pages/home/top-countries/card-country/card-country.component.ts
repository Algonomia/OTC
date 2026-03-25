import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    ButtonLinkOutlineComponent,
    CountriesService,
    CountryFlagComponent,
    LabelCountHiddenComponent,
    LabelValidatedComponent,
    ListItemsHandlerComponent,
    QueryParamsType
} from '@algonomia/angular-sdk';
import {AuthLinkedinService} from '../../../../sdk/global-services/auth.linkedin.service';
import {ICountryBadge} from '@otc/domain';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-card-country',
    templateUrl: './card-country.component.html',
    styleUrl: './card-country.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        CountryFlagComponent,
        LabelValidatedComponent,
        ListItemsHandlerComponent,
        LabelCountHiddenComponent,
        ButtonLinkOutlineComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardCountryComponent implements OnInit {
    @Input() country!: ICountryBadge;
    public queryParams!: QueryParamsType;
    countryName: string = '';

    constructor(
        public authLinkedinService: AuthLinkedinService,
        private _translate: TranslateService,
    ) {}

    ngOnInit(): void {
        if (!this.country) {
            return;
        }

        this.countryName = CountriesService.getName(this.country.iso2, this._translate.currentLang);
        this.queryParams = {
            country1: this.country.iso2,
            country2: this.country.iso2
        };
    }
}
