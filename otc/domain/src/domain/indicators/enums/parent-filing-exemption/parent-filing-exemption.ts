import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EParentFilingExemptionId {
    Yes = 'Yes',
    No = 'No'
}

export class ParentFilingExemption extends AEnhancedEnumFactory {
    static yes = new ParentFilingExemption(EParentFilingExemptionId.Yes, 'ObligationDueDateDomain.ParentFilingExemption.Yes.text', 'ObligationDueDateDomain.ParentFilingExemption.Yes.info', 'Action/Navigation/ValidCircled');
    static no = new ParentFilingExemption(EParentFilingExemptionId.No, 'ObligationDueDateDomain.ParentFilingExemption.No.text', 'ObligationDueDateDomain.ParentFilingExemption.No.info', 'Action/Navigation/CloseCircled');

    static getFromBool(x?: boolean | null) {
        if (!!x) {
            return this.yes;
        } else {
            return this.no;
        }
    }

    static getText(id: EParentFilingExemptionId): string {
        return (this.getByIdOrId(id) as ParentFilingExemption | undefined)?.text ?? id;
    }

    static getInfo(id: EParentFilingExemptionId): string {
        return (this.getByIdOrId(id) as ParentFilingExemption | undefined)?.info ?? id;
    }

    private constructor(
        protected __id: EParentFilingExemptionId,
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
