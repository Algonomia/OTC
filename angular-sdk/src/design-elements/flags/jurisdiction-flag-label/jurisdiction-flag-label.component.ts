import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CountriesService} from '../../../global-services/countries.service';
import {CountryFlagComponent} from '../country-flag/country-flag.component';
import {LabelInfoComponent} from '../../labels/labels/label-info/label-info.component';

@Component({
  selector: 'app-jurisdiction-flag-label',
    imports: [
        CountryFlagComponent,
        LabelInfoComponent
    ],
  templateUrl: './jurisdiction-flag-label.component.html',
  styleUrl: './jurisdiction-flag-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class JurisdictionFlagLabelComponent {
    @Input() set iso2(iso2: string) {
        this.__iso2 = iso2;
        this.__title = CountriesService.getName(iso2, this._translate.currentLang);
    }

    protected __iso2!: string;
    protected __title!: string;

    constructor(private _translate: TranslateService) {}
}
