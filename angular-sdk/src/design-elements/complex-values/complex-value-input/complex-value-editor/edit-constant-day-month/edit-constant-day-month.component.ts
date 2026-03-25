import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {IDayMonth, IDayMonthConstant} from '@algonomia/ts-shared';
import {DayMonthSelectorComponent} from '../../../../day-month-selector/day-month-selector.component';

@Component({
  selector: 'app-edit-constant-day-month',
    imports: [
        DayMonthSelectorComponent
    ],
  templateUrl: './edit-constant-day-month.component.html',
  styleUrl: './edit-constant-day-month.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantDayMonthComponent {
    @Input() dayMonthComplexValue!: IDayMonthConstant;

    constructor(private _cd: ChangeDetectorRef) {}

    changeValue(val: Partial<IDayMonth> | null) {
        this.dayMonthComplexValue.value = val as IDayMonth ?? undefined;
        this._cd.markForCheck();
    }
}
