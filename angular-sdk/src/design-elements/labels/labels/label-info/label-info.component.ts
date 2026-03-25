import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-info',
    templateUrl: './label-info.component.html',
    styleUrls: ['./label-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelInfoComponent {
    @Input() icon: string = '';
    @Input() text: string = '';
    @Input() radius: string = '3px';

    public color_theme: Color_theme = 'main-0';
    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';

    constructor() {}
}
