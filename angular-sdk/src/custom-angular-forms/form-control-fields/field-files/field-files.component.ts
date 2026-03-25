import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    FilesFormControlComponent
} from '../../../design-elements/form-controls/files-form-control/files-form-control.component';
import {MetaFormControl} from '../../metaforms';
import {FileMeta} from '@algonomia/ts-shared';

@Component({
  selector: 'app-field-files',
    imports: [
        FilesFormControlComponent
    ],
  templateUrl: './field-files.component.html',
  styleUrl: './field-files.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldFilesComponent {
    @Input() formControl!: MetaFormControl<File[], FileMeta>;
}
