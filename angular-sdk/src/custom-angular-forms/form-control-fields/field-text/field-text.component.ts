import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    TextFormControlComponent
} from '../../../design-elements/form-controls/text-form-control/text-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {StringMeta} from '@algonomia/ts-shared';

@Component({
    selector: 'app-field-text',
    templateUrl: './field-text.component.html',
    styleUrls: ['./field-text.component.scss'],
    standalone: true,
    imports: [
        TextFormControlComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldTextComponent {
    @Input() formControl!: MetaFormControl<string | null, StringMeta>;
}
