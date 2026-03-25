import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {DisplayRangeInputComponent} from '../../display-range-input/display-range-input.component';

@Component({
    selector: 'app-percentage-form-control',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FormControlTemplateComponent,
        DisplayRangeInputComponent,
    ],
    templateUrl: './percentage-form-control.component.html',
    styleUrl: './percentage-form-control.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PercentageFormControlComponent {
    @Input() formControls!: FormControl<number | null>;
    @Input() min!: number;
    @Input() max!: number;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() placeholder?: string;
    @Input() editable: boolean = true;
}
