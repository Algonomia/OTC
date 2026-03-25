import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MetaFormControl} from '../../metaforms';
import {NumberMeta} from '@algonomia/ts-shared';
import {
    PercentageFormControlComponent
} from '../../../design-elements/form-controls/percentage-form-control/percentage-form-control.component';

@Component({
    selector: 'app-field-bounded-number',
    imports: [
        PercentageFormControlComponent
    ],
    templateUrl: './field-bounded-number.component.html',
    styleUrl: './field-bounded-number.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldBoundedNumberComponent {
    @Input() formControl!: MetaFormControl<number | null, NumberMeta>;
}
