import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-menu',
    templateUrl: './label-menu.component.html',
    styleUrls: ['./label-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelMenuComponent {
    @Input() text: string = '';
    @Input() is_open: boolean = false;
    @Input() symbol: string = '';

    public color_theme: Color_theme = 'link-2';
    public height = 34;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';

    constructor() {}
}
