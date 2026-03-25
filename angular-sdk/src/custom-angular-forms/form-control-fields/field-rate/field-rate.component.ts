import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    StarRatingFormControlComponent
} from '../../../design-elements/form-controls/star-rating-form-control/star-rating-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {RateMeta} from '@algonomia/ts-shared';

@Component({
  selector: 'app-field-rate',
    imports: [
        StarRatingFormControlComponent
    ],
  templateUrl: './field-rate.component.html',
  styleUrl: './field-rate.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FieldRateComponent {
    @Input() formControl!: MetaFormControl<number | null, RateMeta>;
}
