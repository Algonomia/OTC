import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {EBaseTypes, TComplexValue, IScope} from '@algonomia/ts-shared';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {ITag} from '@algonomia/ts-shared';
import {ComplexValueInputComponent} from '../../complex-values/complex-value-input/complex-value-input.component';

@Component({
  selector: 'app-complex-value-form-control',
    imports: [
        FormControlTemplateComponent,
        ReactiveFormsModule,
        ComplexValueInputComponent
    ],
  templateUrl: './complex-value-form-control.component.html',
  styleUrl: './complex-value-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplexValueFormControlComponent {
    @Input() formControl!: FormControl<TComplexValue | null>;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() placeholder?: string;
    @Input() expected_type: EBaseTypes | null = null;
    @Input() tag_list: ITag[] = [];
    @Input() scope_list: IScope[] = [];
}
