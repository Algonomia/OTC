import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {DisplayRateAsStarsComponent} from '../../display-rate-as-stars/display-rate-as-stars.component';

@Component({
  selector: 'app-star-rating-form-control',
    imports: [
        FormControlTemplateComponent,
        DisplayRateAsStarsComponent
    ],
  templateUrl: './star-rating-form-control.component.html',
  styleUrl: './star-rating-form-control.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class StarRatingFormControlComponent {
    @Input() formControl!: FormControl<number | null>;
    @Input() editable: boolean = true;
    @Input() maxRate: number = 5;
    @Input() label?: string;
    @Input() required?: boolean;

    constructor(private _cd: ChangeDetectorRef) {}

    changeValue(rate: number) {
        if (!this.editable) {
            return;
        }
        this.formControl.setValue(rate);
        this.formControl.markAsTouched();
        this._cd.markForCheck();
    }
}
