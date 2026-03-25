import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input} from '@angular/core';
import {IPeriod, IPeriodConstant} from '@algonomia/ts-shared';
import {PeriodSelectorComponent} from '../../../../period-selector/period-selector.component';

@Component({
  selector: 'app-edit-constant-period',
    imports: [
        PeriodSelectorComponent
    ],
  templateUrl: './edit-constant-period.component.html',
  styleUrl: './edit-constant-period.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantPeriodComponent {
    periodComplexValue = input<Partial<IPeriodConstant>>();

    constructor(private _cd: ChangeDetectorRef) {}

    changeValue(period: Partial<IPeriod> | null) {
        const complexValue = this.periodComplexValue();
        if (!complexValue) {
            return;
        }
        complexValue.value = period as IPeriod;
        this._cd.markForCheck();
    }
}
