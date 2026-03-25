import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EFilingResponsibilityId {
    LocalEntity = 'LocalEntity',
    HeadOfTaxGroup = 'HeadOfTaxGroup',
    FilingConstituentEntity = 'FilingConstituentEntity',
    UltimateParentEntity = 'UltimateParentEntity'
}

export class FilingResponsibility extends AEnhancedEnumFactory {
    static local_entity = new FilingResponsibility(EFilingResponsibilityId.LocalEntity, 'ObligationDueDateDomain.FilingResponsibility.LocalEntity.text', 'ObligationDueDateDomain.FilingResponsibility.LocalEntity.info');
    static head_of_tax_group = new FilingResponsibility(EFilingResponsibilityId.HeadOfTaxGroup, 'ObligationDueDateDomain.FilingResponsibility.HeadOfTaxGroup.text', 'ObligationDueDateDomain.FilingResponsibility.HeadOfTaxGroup.info');
    static filing_constituent_entity = new FilingResponsibility(EFilingResponsibilityId.FilingConstituentEntity, 'ObligationDueDateDomain.FilingResponsibility.FilingConstituentEntity.text', 'ObligationDueDateDomain.FilingResponsibility.FilingConstituentEntity.info');
    static ultimate_parent_entity = new FilingResponsibility(EFilingResponsibilityId.UltimateParentEntity, 'ObligationDueDateDomain.FilingResponsibility.UltimateParentEntity.text', 'ObligationDueDateDomain.FilingResponsibility.UltimateParentEntity.info');

    static getText(id: EFilingResponsibilityId): string {
        return (this.getByIdOrId(id) as FilingResponsibility | undefined)?.text ?? id;
    }

    static getInfo(id: EFilingResponsibilityId): string {
        return (this.getByIdOrId(id) as FilingResponsibility | undefined)?.info ?? id;
    }

    static getAllIds(): EFilingResponsibilityId[] {
        return (this.getAllAvailables() as FilingResponsibility[]).map(x => x.id as EFilingResponsibilityId);
    }

    private constructor(protected __id: EFilingResponsibilityId, readonly text: string = __id, readonly info: string = '') {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
