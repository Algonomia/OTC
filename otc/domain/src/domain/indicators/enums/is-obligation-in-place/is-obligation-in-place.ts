import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EIsObligationInPlaceId {
    InPlace = 'InPlace',
    NotEnforced = 'NotEnforced',
    NotExist = 'NotExist'
}

export class IsObligationInPlace extends AEnhancedEnumFactory {
    static in_place = new IsObligationInPlace(EIsObligationInPlaceId.InPlace, 'ObligationDueDateDomain.IsObligationInPlace.InPlace.text', 'ObligationDueDateDomain.IsObligationInPlace.InPlace.info');
    static not_enforced = new IsObligationInPlace(EIsObligationInPlaceId.NotEnforced, 'ObligationDueDateDomain.IsObligationInPlace.NotEnforced.text', 'ObligationDueDateDomain.IsObligationInPlace.NotEnforced.info');
    static not_exist = new IsObligationInPlace(EIsObligationInPlaceId.NotExist, 'ObligationDueDateDomain.IsObligationInPlace.NotExist.text', 'ObligationDueDateDomain.IsObligationInPlace.NotExist.info');

    static getText(id: EIsObligationInPlaceId): string {
        return (this.getByIdOrId(id) as IsObligationInPlace | undefined)?.text ?? id;
    }

    static getInfo(id: EIsObligationInPlaceId): string {
        return (this.getByIdOrId(id) as IsObligationInPlace | undefined)?.info ?? id;
    }

    static getAllIds(): EIsObligationInPlaceId[] {
        return (this.getAllAvailables() as IsObligationInPlace[]).map(x => x.id as EIsObligationInPlaceId);
    }

    private constructor(protected __id: EIsObligationInPlaceId, readonly text: string = __id, readonly info: string = '') {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}
