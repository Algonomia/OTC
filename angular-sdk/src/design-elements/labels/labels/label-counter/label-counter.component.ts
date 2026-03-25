import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Border_theme, Color_theme, LabelComponent} from "../../label.component";
import {NgTemplateOutlet} from "@angular/common";
import {IconWeight} from '../../../algo-icon/weight-handler';

@Component({
  selector: 'app-label-counter',
    imports: [
        LabelComponent,
        NgTemplateOutlet
    ],
  templateUrl: './label-counter.component.html',
  styleUrl: './label-counter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LabelCounterComponent {
    @Input() counter: number = 0;

    public color_theme: Color_theme = 'orange-3';
    public height = 28;
    public border_theme: Border_theme = 'border-none';
    public weight: IconWeight = 'Medium';

    constructor() {}
}
