import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MetaFormControl} from '../../metaforms';
import {NumberMeta} from '@algonomia/ts-shared';
import {
    NumberFormControlComponent
} from '../../../design-elements/form-controls/number-form-control/number-form-control.component';

@Component({
  selector: 'app-field-number',
    imports: [
        NumberFormControlComponent
    ],
  templateUrl: './field-number.component.html',
  styleUrl: './field-number.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldNumberComponent {
    @Input() formControl!: MetaFormControl<number | null, NumberMeta>;
}
