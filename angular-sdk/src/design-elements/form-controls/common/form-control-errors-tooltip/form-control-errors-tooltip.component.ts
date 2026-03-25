import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {FormControlErrorsComponent} from '../form-control-errors/form-control-errors.component';
import {Tooltip} from 'primeng/tooltip';

@Component({
    selector: 'app-form-control-errors-tooltip',
    imports: [
        FormControlErrorsComponent,
        Tooltip
    ],
    templateUrl: './form-control-errors-tooltip.component.html',
    styleUrl: './form-control-errors-tooltip.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlErrorsTooltipComponent {
    @Input() displayErrors = true;
    @Input() errors?: ValidationErrors | null;
}
