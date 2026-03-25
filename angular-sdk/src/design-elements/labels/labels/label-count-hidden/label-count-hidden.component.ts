import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-count-hidden',
    templateUrl: './label-count-hidden.component.html',
    styleUrls: ['./label-count-hidden.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelCountHiddenComponent {
    @Input() counter: number = 0;

    public color_theme: Color_theme = 'main-0';
    public height = 34;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';

    constructor() {}
}
