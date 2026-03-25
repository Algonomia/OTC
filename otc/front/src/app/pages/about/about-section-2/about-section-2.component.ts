import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {IPanelInline, IPanelInlineImg, PanelSynchroInlineComponent} from '@algonomia/angular-sdk';
import {TranslatePipe} from '@ngx-translate/core';
import {FaqComponent} from './faq/faq.component';

@Component({
    selector: 'app-about-section-2',
    imports: [
        PanelSynchroInlineComponent,
        TranslatePipe,
        FaqComponent,
    ],
    templateUrl: './about-section-2.component.html',
    styleUrl: './about-section-2.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection2Component implements AfterViewInit {
    @ViewChild('faqTpl') faqTpl!: TemplateRef<unknown>;
    @ViewChild('sponsorship') sponsorshipTpl!: TemplateRef<unknown>;

    panels: (IPanelInline | IPanelInlineImg)[] = [];

    constructor(
        private _cd: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.panels = [
            {
                type: 'panel',
                title: 'OTCFront.About.Panels.FAQ.title',
                icon: 'People/User/Help',
                contentTpl: this.faqTpl,
                defSelected: false
            },
            {
                type: 'image',
                alt: 'Group',
                path: 'assets/images/Group.svg'
            },
            {
                type: 'panel',
                title: 'OTCFront.About.Panels.Sponsorship.title',
                icon: 'People/Community/Discussion',
                contentTpl: this.sponsorshipTpl,
                defSelected: true
            },
        ];
        this._cd.detectChanges();
    }
}
