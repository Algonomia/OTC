import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {
    LabelSecondaryLightComponent
} from '../../../labels/labels/label-secondary-light/label-secondary-light.component';

@Component({
  selector: 'app-form-control-label',
    imports: [
        TranslatePipe,
        LabelSecondaryLightComponent
    ],
  templateUrl: './form-control-label.component.html',
  styleUrl: './form-control-label.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlLabelComponent {
    @Input() label?: string;
    @Input() required?: boolean;
}
