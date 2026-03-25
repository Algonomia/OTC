import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FormControlTemplateComponent} from "../common/form-control-template/form-control-template.component";
import {PeriodSelectorComponent} from '../../period-selector/period-selector.component';
import {IPeriod} from '@algonomia/ts-shared';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-period-form-control',
    imports: [
        FormControlTemplateComponent,
        PeriodSelectorComponent
    ],
  templateUrl: './period-form-control.component.html',
  styleUrl: './period-form-control.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodFormControlComponent extends ATemplateComponent implements OnInit {
    @Input() formControl!: FormControl<Partial<IPeriod> | null>;
    @Input() required?: boolean;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() placeholder_2?: string;
    @Input() placeholder_3?: string;

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
    }

    onPeriodChange(period: Partial<IPeriod> | null) {
        if (this._periodsEqual(this.formControl.value, period)) {
            return;
        }
        this.formControl.setValue(period);
        this.formControl.markAllAsTouched();
        this._cd.markForCheck();
    }

    private _periodsEqual(a: Partial<IPeriod> | null, b: Partial<IPeriod> | null): boolean {
        if (a === b) return true;
        if (!a || !b) return false;
        return a.value === b.value && a.unit === b.unit && a.dayCountType === b.dayCountType;
    }
}
