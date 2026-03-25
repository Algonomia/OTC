import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-text-form-control',
    imports: [
        ReactiveFormsModule,
        FormControlTemplateComponent,
        TranslatePipe
    ],
  templateUrl: './text-form-control.component.html',
  styleUrl: './text-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFormControlComponent {
    @Input() formControl!: FormControl<string | null>;
    @Input() minLength?: number;
    @Input() maxLength?: number;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() placeholder?: string;
}
