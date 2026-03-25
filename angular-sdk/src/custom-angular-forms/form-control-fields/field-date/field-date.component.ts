import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    DateFormControlComponent
} from '../../../design-elements/form-controls/date-form-control/date-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {DateMeta} from '@algonomia/ts-shared';

@Component({
  selector: 'app-field-date',
    imports: [
        DateFormControlComponent
    ],
  templateUrl: './field-date.component.html',
  styleUrl: './field-date.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FieldDateComponent {
    @Input() formControl!: MetaFormControl<Date, DateMeta>;
}

