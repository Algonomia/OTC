import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-number-form-control',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FormControlTemplateComponent,
        TranslatePipe
    ],
  templateUrl: './number-form-control.component.html',
  styleUrl: './number-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFormControlComponent {
    @Input() formControl!: FormControl<number | null>;
    @Input() min?: number;
    @Input() max?: number;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() placeholder?: string;
}
