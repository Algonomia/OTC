import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FileLabelComponent} from '../../files/file-label/file-label.component';
import {FilePlaceholderComponent} from '../../files/file-placeholder/file-placeholder.component';
import {FileUnits} from '@algonomia/ts-shared';
import {FormControlErrorsComponent} from '../common/form-control-errors/form-control-errors.component';

@Component({
  selector: 'app-files-form-control',
    imports: [
        FileLabelComponent,
        FilePlaceholderComponent,
        FormControlErrorsComponent
    ],
  templateUrl: './files-form-control.component.html',
  styleUrl: './files-form-control.component.css'
})
export class FilesFormControlComponent {
    @Input() formControl!: FormControl<File[] | null>;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() extensions?: string[];
    @Input() required?: boolean;
    @Input() multiple?: boolean;
    @Input() maxSize?: number;
    @Input() maxSizeUnit?: FileUnits;

    constructor(private _cd: ChangeDetectorRef) {}

    addFormValue(newFiles: File[]) {
        const files = [...(this.formControl?.value ?? []), ...newFiles];
        this._update(files);
    }

    removeFormValue(file: File) {
        const files = (this.formControl?.value ?? []).filter((x: File) => x !== file);
        this._update(files);
    }

    private _update(files: File[]) {
        this.formControl?.setValue(files);
        this.formControl?.markAsTouched();
        this._cd.markForCheck();
    }
}
