import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-expired',
    templateUrl: './label-expired.component.html',
    styleUrls: ['./label-expired.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelExpiredComponent {
    @Input() text: boolean = true;

    public color_theme: Color_theme = 'grey-7-outline';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
