import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EApplicableEntityTypeId {
    Company = 'Company',
    PE = 'PE',
    Partnership = 'Partnership',
    TrustFoundation = 'Trust/Foundation',
    Other = 'Other'
}

export class ApplicableEntityType extends AEnhancedEnumFactory {
    static company = new ApplicableEntityType(EApplicableEntityTypeId.Company, 'ObligationDueDateDomain.ApplicableEntityTypes.Company.text', 'ObligationDueDateDomain.ApplicableEntityTypes.Company.info');
    static pe = new ApplicableEntityType(EApplicableEntityTypeId.PE, 'ObligationDueDateDomain.ApplicableEntityTypes.PE.text', 'ObligationDueDateDomain.ApplicableEntityTypes.PE.info');
    static partnership = new ApplicableEntityType(EApplicableEntityTypeId.Partnership, 'ObligationDueDateDomain.ApplicableEntityTypes.Partnership.text', 'ObligationDueDateDomain.ApplicableEntityTypes.Partnership.info');
    static trust_foundation = new ApplicableEntityType(EApplicableEntityTypeId.TrustFoundation, 'ObligationDueDateDomain.ApplicableEntityTypes.TrustFoundation.text', 'ObligationDueDateDomain.ApplicableEntityTypes.TrustFoundation.info');
    static other = new ApplicableEntityType(EApplicableEntityTypeId.Other, 'ObligationDueDateDomain.ApplicableEntityTypes.Other.text', 'ObligationDueDateDomain.ApplicableEntityTypes.Other.info');

    static getText(id: EApplicableEntityTypeId): string {
        return (this.getByIdOrId(id) as ApplicableEntityType | undefined)?.text ?? id;
    }

    static getInfo(id: EApplicableEntityTypeId): string {
        return (this.getByIdOrId(id) as ApplicableEntityType | undefined)?.info ?? id;
    }


    static getAllIds(): EApplicableEntityTypeId[] {
        return (this.getAllAvailables() as ApplicableEntityType[]).map(x => x.id as EApplicableEntityTypeId);
    }

    private constructor(protected __id: EApplicableEntityTypeId, readonly text: string = __id, readonly info: string = '') {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
