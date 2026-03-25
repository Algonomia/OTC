import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    SubdateFormControlComponent
} from '../../../design-elements/form-controls/subdate-form-control/subdate-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {DayMonthMeta, IDayMonth} from '@algonomia/ts-shared';

@Component({
  selector: 'app-field-sub-date',
    imports: [
        SubdateFormControlComponent
    ],
  templateUrl: './field-sub-date.component.html',
  styleUrl: './field-sub-date.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldSubDateComponent {
    @Input() formControl!: MetaFormControl<IDayMonth | null, DayMonthMeta>;
}
