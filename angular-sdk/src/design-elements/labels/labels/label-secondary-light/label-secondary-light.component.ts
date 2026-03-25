import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-secondary-light',
    templateUrl: './label-secondary-light.component.html',
    styleUrls: ['./label-secondary-light.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelSecondaryLightComponent {
    @Input() icon?: string = '';
    @Input() text!: string;

    public color_theme: Color_theme = 'grey-1';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';

    constructor() {}
}
