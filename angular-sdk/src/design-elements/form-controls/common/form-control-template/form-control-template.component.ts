import {ChangeDetectionStrategy, Component, Input, TemplateRef} from '@angular/core';
import {FormControlLabelComponent} from '../form-control-label/form-control-label.component';
import {NgTemplateOutlet} from '@angular/common';
import {ValidationErrors} from '@angular/forms';
import {FormControlErrorsComponent} from '../form-control-errors/form-control-errors.component';

@Component({
  selector: 'app-form-control-template',
    imports: [
        FormControlLabelComponent,
        NgTemplateOutlet,
        FormControlErrorsComponent
    ],
  templateUrl: './form-control-template.component.html',
  styleUrl: './form-control-template.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlTemplateComponent {
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() inputTpl!: TemplateRef<any>;
    @Input() displayErrors = true;
    @Input() errors?: ValidationErrors | null;
}
