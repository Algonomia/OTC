import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {TranslatePipe} from '@ngx-translate/core';
import {TJsonObject, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {JsonStringifyPipe} from './json-stringify/json-stringify.pipe';

@Component({
  selector: 'app-object-form-control',
    imports: [
        ReactiveFormsModule,
        FormControlTemplateComponent,
        TranslatePipe,
        JsonStringifyPipe
    ],
  templateUrl: './object-form-control.component.html',
  styleUrl: './object-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectFormControlComponent {
    @Input() formControl!: FormControl<TJsonObject | null>;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() placeholder?: string;

    constructor(private _cd: ChangeDetectorRef) {}

    onNewValue(event: Event) {
        const value = (event.target as HTMLInputElement)?.value;
        if (isNullOrUndefined(value)) {
            this.formControl.setValue(null);
        }
        let jValue;
        try {
            jValue = JSON.parse(value!)
        } catch(e) {
            jValue = value;
        }
        this.formControl.setValue(jValue);
        this.formControl.markAllAsTouched();
        this._cd.markForCheck();
    }
}
