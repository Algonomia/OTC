import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {IPanelInline, PanelSynchroInlineComponent} from '@algonomia/angular-sdk';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-about-section-1',
    imports: [
        PanelSynchroInlineComponent,
        TranslatePipe
    ],
    templateUrl: './about-section-1.component.html',
    styleUrl: './about-section-1.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection1Component implements AfterViewInit {
    @ViewChild('whyTpl') whyTpl!: TemplateRef<unknown>;
    @ViewChild('whatTpl') whatTpl!: TemplateRef<unknown>;
    @ViewChild('howTpl') howTpl!: TemplateRef<unknown>;

    panels: IPanelInline[] = [];

    constructor(
        private _cd: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.panels = [
            {
                type: 'panel',
                title: 'OTCFront.About.Panels.Why.title',
                icon: 'People/Community/Idea',
                contentTpl: this.whyTpl,
                defSelected: true
            },
            {
                type: 'panel',
                title: 'OTCFront.About.Panels.What.title',
                icon: 'System/Data/AgendaDate',
                contentTpl: this.whatTpl,
                defSelected: false
            },
            {
                type: 'panel',
                title: 'OTCFront.About.Panels.How.title',
                icon: 'System/Class/AI',
                contentTpl: this.howTpl,
                defSelected: false
            },
        ];
        this._cd.detectChanges();
    }
}
