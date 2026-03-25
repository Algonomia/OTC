import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EEnglishAcceptedId {
    FullyAccepted = 'FullyAccepted',
    PartlyAccepted = 'PartlyAccepted',
    AcceptedWithTranslationRequired = 'AcceptedWithTranslationRequired',
    NotAccepted = 'NotAccepted',
    NotApplicable = 'NotApplicable'
}

export class EnglishAccepted extends AEnhancedEnumFactory {
    static fully_accepted = new EnglishAccepted(EEnglishAcceptedId.FullyAccepted, 'ObligationDueDateDomain.EnglishAccepted.FullyAccepted.text', 'ObligationDueDateDomain.EnglishAccepted.FullyAccepted.info');
    static partly_accepted = new EnglishAccepted(EEnglishAcceptedId.PartlyAccepted, 'ObligationDueDateDomain.EnglishAccepted.PartlyAccepted.text', 'ObligationDueDateDomain.EnglishAccepted.PartlyAccepted.info');
    static accepted_with_translation_required = new EnglishAccepted(EEnglishAcceptedId.AcceptedWithTranslationRequired, 'ObligationDueDateDomain.EnglishAccepted.AcceptedWithTranslationRequired.text', 'ObligationDueDateDomain.EnglishAccepted.AcceptedWithTranslationRequired.info');
    static not_accepted = new EnglishAccepted(EEnglishAcceptedId.NotAccepted, 'ObligationDueDateDomain.EnglishAccepted.NotAccepted.text', 'ObligationDueDateDomain.EnglishAccepted.NotAccepted.info');
    static not_applicable = new EnglishAccepted(EEnglishAcceptedId.NotApplicable, 'ObligationDueDateDomain.EnglishAccepted.NotApplicable.text', 'ObligationDueDateDomain.EnglishAccepted.NotApplicable.info');

    static getText(id: EEnglishAcceptedId): string {
        return (this.getByIdOrId(id) as EnglishAccepted | undefined)?.text ?? id;
    }

    static getInfo(id: EEnglishAcceptedId): string {
        return (this.getByIdOrId(id) as EnglishAccepted | undefined)?.info ?? id;
    }

    static getAllIds(): EEnglishAcceptedId[] {
        return (this.getAllAvailables() as EnglishAccepted[]).map(x => x.id as EEnglishAcceptedId);
    }

    private constructor(protected __id: EEnglishAcceptedId, readonly text: string = __id, readonly info: string = '') {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
