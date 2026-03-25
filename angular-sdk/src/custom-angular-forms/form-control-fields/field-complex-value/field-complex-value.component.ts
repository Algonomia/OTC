import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MetaFormControl} from '../../metaforms';
import {TComplexValue} from '@algonomia/ts-shared';
import {ComplexValueMeta} from '@algonomia/ts-shared';
import {
    ComplexValueFormControlComponent
} from '../../../design-elements/form-controls/complex-value-form-control/complex-value-form-control.component';

@Component({
  selector: 'app-field-complex-value',
    imports: [
        ComplexValueFormControlComponent
    ],
  templateUrl: './field-complex-value.component.html',
  styleUrl: './field-complex-value.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldComplexValueComponent {
    @Input() formControl!: MetaFormControl<TComplexValue | null, ComplexValueMeta>;
}
