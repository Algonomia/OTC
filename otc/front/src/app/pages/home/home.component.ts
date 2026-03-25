import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeCompletionSectionComponent} from './home-completion-section/home-completion-section.component';
import {HomeSponsorsSectionComponent} from './home-sponsors-section/home-sponsors-section.component';
import {HomeIntroSectionComponent} from './home-intro-section/home-intro-section.component';
import {TopCountriesComponent} from './top-countries/top-countries.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {SeoService} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        HomeCompletionSectionComponent,
        HomeSponsorsSectionComponent,
        HomeIntroSectionComponent,
        TopCountriesComponent,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

    constructor(
        private _seoService: SeoService,
        private _translate: TranslateService
    ) {}

    ngOnInit(): void {
        this._seoService.updateSeo({
            title: this._translate.instant('OTCFront.Home.MetaTitle'),
            description: this._translate.instant('OTCFront.Home.MetaDescription')
        });
    }

}
