import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {OrganizationType} from '@otc/domain';
import {LabelInfoComponent} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-algo-table-organization-type',
    imports: [
        LabelInfoComponent
    ],
    templateUrl: './algo-table-organization-type.component.html',
    styleUrl: './algo-table-organization-type.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableOrganizationTypeComponent {
    @Input() set organizationType(organizationType: OrganizationType | string) {
        this.__organizationTypeText = typeof organizationType === 'string' ? organizationType : OrganizationType.getText(organizationType.id);
        this.__organizationTypeIcon = typeof organizationType !== 'string' ? organizationType?.icon : null;
    }

    protected __organizationTypeText!: string;
    protected __organizationTypeIcon!: string | null;
}
