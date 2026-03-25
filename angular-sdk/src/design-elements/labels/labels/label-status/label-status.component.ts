import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, LabelComponent} from "../../label.component";
import {IconWeight} from '../../../algo-icon/weight-handler';
import {NgTemplateOutlet} from '@angular/common';

export type TypeStatus = 'ok' | 'ko';

@Component({
    selector: 'app-label-status',
    templateUrl: './label-status.component.html',
    styleUrls: ['./label-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
    standalone: true
})
export class LabelStatusComponent {
    @Input() icon: string = '';
    @Input() text: string = '';
    @Input() radius: string = '3px';
    @Input() type: TypeStatus = 'ok';

    public height = 30;
    public border_theme: Border_theme = 'border-1';
    public weight: IconWeight = 'Regular';
}
