import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {
    ParentFilingExemption, EParentFilingExemptionId,
} from '@otc/domain';
import {LabelStatusComponent} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-algo-table-parent-filing-exemption',
    imports: [
        LabelStatusComponent
    ],
    templateUrl: './algo-table-parent-filing-exemption.component.html',
    styleUrl: './algo-table-parent-filing-exemption.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableParentFilingExemptionComponent {
    @Input() parentFilingExemption?: ParentFilingExemption;

    protected EParentFilingExemptionId = EParentFilingExemptionId;
}
