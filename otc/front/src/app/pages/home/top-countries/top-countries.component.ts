import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardCountryComponent} from './card-country/card-country.component';
import {SliderComponent} from '@algonomia/angular-sdk';
import {CompletionFetcherService} from '../../../Domain/completion/completion-fetcher.service';
import {ICountryBadge} from '@otc/domain';

@Component({
    selector: 'app-top-countries',
    templateUrl: './top-countries.component.html',
    styleUrl: './top-countries.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        CardCountryComponent,
        SliderComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopCountriesComponent implements OnInit {
    public top_countries: ICountryBadge[] = [];

    constructor(
        private _completionFetcherService: CompletionFetcherService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this._completionFetcherService.getCountryBadges().then((top_countries: ICountryBadge[]) => {
            this.top_countries = top_countries;
            this._cdr.markForCheck();
        });
    }
}
