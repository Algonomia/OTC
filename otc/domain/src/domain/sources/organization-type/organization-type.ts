import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EOrganizationTypeId {
    Legislation = 'Legislation',
    TaxAdmin = 'TaxAdmin',
    Regulation = 'Regulation',
    OtherPrimarySource = 'OtherPrimarySource',
    ConsultingFirm = 'ConsultingFirm',
    InternationalOrg = 'InternationalOrg',
    OtherSecondarySource = 'OtherSecondarySource'
}

export class OrganizationType extends AEnhancedEnumFactory {
    static legislation = new OrganizationType(EOrganizationTypeId.Legislation, 'ObligationDueDateDomain.OrganizationType.Legislation.text', 'ObligationDueDateDomain.OrganizationType.Legislation.info', 'System/Class/Legal');
    static tax_admin = new OrganizationType(EOrganizationTypeId.TaxAdmin, 'ObligationDueDateDomain.OrganizationType.TaxAdmin.text', 'ObligationDueDateDomain.OrganizationType.TaxAdmin.info', 'System/Class/Admin');
    static regulation = new OrganizationType(EOrganizationTypeId.Regulation, 'ObligationDueDateDomain.OrganizationType.Regulation.text', 'ObligationDueDateDomain.OrganizationType.Regulation.info', 'System/Class/Law');
    static other_primary_source = new OrganizationType(EOrganizationTypeId.OtherPrimarySource, 'ObligationDueDateDomain.OrganizationType.OtherPrimarySource.text', 'ObligationDueDateDomain.OrganizationType.OtherPrimarySource.info', 'System/Class/Source1');
    static consulting_firm = new OrganizationType(EOrganizationTypeId.ConsultingFirm, 'ObligationDueDateDomain.OrganizationType.ConsultingFirm.text', 'ObligationDueDateDomain.OrganizationType.ConsultingFirm.info', 'System/Class/ConsultingFirm');
    static international_org = new OrganizationType(EOrganizationTypeId.InternationalOrg, 'ObligationDueDateDomain.OrganizationType.InternationalOrg.text', 'ObligationDueDateDomain.OrganizationType.InternationalOrg.info', 'System/Data/Map');
    static other_secondary_source = new OrganizationType(EOrganizationTypeId.OtherSecondarySource, 'ObligationDueDateDomain.OrganizationType.OtherSecondarySource.text', 'ObligationDueDateDomain.OrganizationType.OtherSecondarySource.info', 'System/Class/Source2');

    static getText(id: EOrganizationTypeId): string {
        return (this.getByIdOrId(id) as OrganizationType | undefined)?.text ?? id;
    }

    static getInfo(id: EOrganizationTypeId): string {
        return (this.getByIdOrId(id) as OrganizationType | undefined)?.info ?? id;
    }

    private constructor(
        protected __id: EOrganizationTypeId,
        readonly text: string = __id,
        readonly info: string = '',
        readonly icon: string = ''
    ) {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
