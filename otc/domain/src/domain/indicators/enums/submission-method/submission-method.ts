import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum ESubmissionMethodId {
    Electronic = 'Electronic',
    Paper = 'Paper',
    UponRequest = 'UponRequest',
    NoDirectFiling = 'NoDirectFiling',
    Mixed = 'Mixed',
    NotApplicable = 'NotApplicable',
    Other = 'Other',
}

export class SubmissionMethod extends AEnhancedEnumFactory {
    static electronic = new SubmissionMethod(ESubmissionMethodId.Electronic, 'ObligationDueDateDomain.SubmissionMethod.Electronic.text', 'ObligationDueDateDomain.SubmissionMethod.Electronic.info');
    static paper = new SubmissionMethod(ESubmissionMethodId.Paper, 'ObligationDueDateDomain.SubmissionMethod.Paper.text', 'ObligationDueDateDomain.SubmissionMethod.Paper.info');
    static upon_request = new SubmissionMethod(ESubmissionMethodId.UponRequest, 'ObligationDueDateDomain.SubmissionMethod.UponRequest.text', 'ObligationDueDateDomain.SubmissionMethod.UponRequest.info');
    static no_direct_filing = new SubmissionMethod(ESubmissionMethodId.NoDirectFiling, 'ObligationDueDateDomain.SubmissionMethod.NoDirectFiling.text', 'ObligationDueDateDomain.SubmissionMethod.NoDirectFiling.info');
    static mixed = new SubmissionMethod(ESubmissionMethodId.Mixed, 'ObligationDueDateDomain.SubmissionMethod.Mixed.text', 'ObligationDueDateDomain.SubmissionMethod.Mixed.info');
    static not_applicable = new SubmissionMethod(ESubmissionMethodId.NotApplicable, 'ObligationDueDateDomain.SubmissionMethod.NotApplicable.text', 'ObligationDueDateDomain.SubmissionMethod.NotApplicable.info');
    static other = new SubmissionMethod(ESubmissionMethodId.Other, 'ObligationDueDateDomain.SubmissionMethod.Other.text', 'ObligationDueDateDomain.SubmissionMethod.Other.info');

    static getText(id: ESubmissionMethodId): string {
        return (this.getByIdOrId(id) as SubmissionMethod | undefined)?.text ?? id;
    }

    static getInfo(id: ESubmissionMethodId): string {
        return (this.getByIdOrId(id) as SubmissionMethod | undefined)?.info ?? id;
    }

    static getAllIds(): ESubmissionMethodId[] {
        return (this.getAllAvailables() as SubmissionMethod[]).map(x => x.id as ESubmissionMethodId);
    }

    private constructor(protected __id: ESubmissionMethodId, readonly text: string = __id, readonly info: string = '') {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
