import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {CountryFlagComponent} from '../country-flag/country-flag.component';
import {CountriesService} from '../../../global-services/countries.service';
import {LabelAllCountriesComponent} from '../../labels/labels/label-all-countries/label-all-countries.component';

@Component({
    selector: 'app-multi-country-flag',
    imports: [
        CountryFlagComponent,
        LabelAllCountriesComponent
    ],
    templateUrl: './multi-country-flag.component.html',
    styleUrl: './multi-country-flag.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiCountryFlagComponent {
    @Input() set countries(arr: string[]) {
        this.__countries = arr;
        this.__hasAllCountries = CountriesService.containsAll(this.__countries);
        this._cd.markForCheck();
    }
    @Input() rounded: boolean = false;
    @Input() size_rem?: number;

    protected __countries: string[] = [];
    protected __hasAllCountries: boolean = false;

    constructor(private _cd: ChangeDetectorRef) {}
}
