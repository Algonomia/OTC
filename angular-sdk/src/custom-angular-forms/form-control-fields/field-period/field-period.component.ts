import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    PeriodFormControlComponent
} from '../../../design-elements/form-controls/period-form-control/period-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {IPeriod, PeriodMeta} from '@algonomia/ts-shared';

@Component({
  selector: 'app-field-period',
    imports: [
        PeriodFormControlComponent
    ],
  templateUrl: './field-period.component.html',
  styleUrl: './field-period.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldPeriodComponent {
    @Input() formControl!: MetaFormControl<IPeriod | null, PeriodMeta>;
}
