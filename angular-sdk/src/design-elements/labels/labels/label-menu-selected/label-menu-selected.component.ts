import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-label-menu-selected',
    templateUrl: './label-menu-selected.component.html',
    styleUrls: ['./label-menu-selected.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelMenuSelectedComponent {
    @Input() text: string = '';

    public color_theme: Color_theme = 'link-2';
    public height: number = 34;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
