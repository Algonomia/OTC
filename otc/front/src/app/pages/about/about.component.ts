import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AboutSection2Component} from './about-section-2/about-section-2.component';
import {AboutSection1Component} from './about-section-1/about-section-1.component';
import {AboutSectionFooterComponent} from './about-section-footer/about-section-footer.component';
import {SeoService} from '@algonomia/angular-sdk';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
    standalone: true,
    imports: [
        AboutSection2Component,
        AboutSection1Component,
        AboutSectionFooterComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {

    constructor(
        private _seoService: SeoService,
        private _translate: TranslateService
    ) {}

    ngOnInit(): void {
        this._seoService.updateSeo({
            title: this._translate.instant('OTCFront.About.MetaTitle'),
            description: this._translate.instant('OTCFront.About.MetaDescription')
        });
    }
}
