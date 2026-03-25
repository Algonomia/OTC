import {ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {KeyValuePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {EValidatorErrors, ValidatorErrors} from '@algonomia/ts-shared';

@Pipe({
    name: 'toErrorText',
    standalone: true
})
export class ToErrorTextPipe implements PipeTransform {
    constructor() {}

    transform(error: EValidatorErrors | any) {
        return ValidatorErrors.getErrorFromId(error);
    }
}

@Component({
  selector: 'app-form-control-errors',
    imports: [
        KeyValuePipe,
        ToErrorTextPipe,
        TranslatePipe
    ],
  templateUrl: './form-control-errors.component.html',
  styleUrl: './form-control-errors.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlErrorsComponent {
    @Input() displayErrors = true;
    @Input() errors?: ValidationErrors | null;
}
