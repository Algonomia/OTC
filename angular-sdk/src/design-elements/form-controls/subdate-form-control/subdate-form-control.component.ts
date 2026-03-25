import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IDayMonth} from '@algonomia/ts-shared';
import {FormControl} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {DayMonthSelectorComponent} from '../../day-month-selector/day-month-selector.component';

@Component({
  selector: 'app-subdate-form-control',
    imports: [
        FormControlTemplateComponent,
        DayMonthSelectorComponent
    ],
  templateUrl: './subdate-form-control.component.html',
  styleUrl: './subdate-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubdateFormControlComponent {
    @Input() formControl!: FormControl<Partial<IDayMonth> | null>;
    @Input() required?: boolean;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() placeholder_2?: string;

    protected onValueChange(newValue: Partial<IDayMonth> | null) {
        this.formControl.setValue(newValue);
        this.formControl.markAsTouched();
        this.formControl.markAsDirty();
    }
}
