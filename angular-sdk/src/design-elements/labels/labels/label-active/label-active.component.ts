import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-active',
    templateUrl: './label-active.component.html',
    styleUrls: ['./label-active.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelActiveComponent {
    @Input() text: boolean = true;

    public color_theme: Color_theme = 'ok-3-outline';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
