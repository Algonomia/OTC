import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent, IconWeight} from '@algonomia/angular-sdk';
import {NgTemplateOutlet} from '@angular/common';
import {SourceStatusExt} from '@otc/domain';

@Component({
    selector: 'app-label-status-source',
    templateUrl: './label-status-source.component.html',
    styleUrls: ['./label-status-source.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelStatusSourceComponent {
    @Input() set valueStatusId(valueStatusId: SourceStatusExt) {
        this.icon = valueStatusId.icon;
        this.color_theme = valueStatusId.color_theme;
        this.text = valueStatusId.text;
    }

    public text: string = '';
    public icon: string = '';
    public color_theme: Color_theme = 'main-3-outline';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
