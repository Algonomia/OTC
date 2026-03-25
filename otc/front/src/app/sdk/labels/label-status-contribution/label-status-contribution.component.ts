import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent, IconWeight} from '@algonomia/angular-sdk';
import {NgTemplateOutlet} from '@angular/common';
import {
    EValuesStatus, ValuesStatusExt
} from '@otc/domain';

@Component({
    selector: 'app-label-status-contribution',
    templateUrl: './label-status-contribution.component.html',
    styleUrls: ['./label-status-contribution.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelStatusContributionComponent {
    @Input() set valueStatusId(valueStatusId: EValuesStatus) {
        const valueStatusExt = ValuesStatusExt.getStatusFromId(valueStatusId);
        if (!valueStatusExt) {
            return;
        }
        this.icon = valueStatusExt.icon;
        this.color_theme = valueStatusExt.color_theme;
        this.text = valueStatusExt.text;
    }

    public text: string = '';
    public icon: string = '';
    public color_theme: Color_theme = 'main-3-outline';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
