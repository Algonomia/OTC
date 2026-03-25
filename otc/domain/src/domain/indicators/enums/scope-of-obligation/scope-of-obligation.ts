import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EScopeOfObligationId {
    Group = 'Group',
    TaxGroup = 'TaxGroup',
    Entity = 'Entity'
}

export class ScopeOfObligation extends AEnhancedEnumFactory {
    static group = new ScopeOfObligation(EScopeOfObligationId.Group, 'ObligationDueDateDomain.ScopeOfObligation.Group.text', 'ObligationDueDateDomain.ScopeOfObligation.Group.info', 'System/Class/Group');
    static tax_group = new ScopeOfObligation(EScopeOfObligationId.TaxGroup, 'ObligationDueDateDomain.ScopeOfObligation.TaxGroup.text', 'ObligationDueDateDomain.ScopeOfObligation.TaxGroup.info', 'System/Class/Group');
    static entity = new ScopeOfObligation(EScopeOfObligationId.Entity, 'ObligationDueDateDomain.ScopeOfObligation.Entity.text', 'ObligationDueDateDomain.ScopeOfObligation.Entity.info', 'System/Class/Entity');

    static getText(id: EScopeOfObligationId): string {
        return (this.getByIdOrId(id) as ScopeOfObligation | undefined)?.text ?? id;
    }

    static getIcon(id: EScopeOfObligationId): string {
        return (this.getByIdOrId(id) as ScopeOfObligation | undefined)?.icon ?? '';
    }

    static getInfo(id: EScopeOfObligationId): string {
        return (this.getByIdOrId(id) as ScopeOfObligation | undefined)?.info ?? id;
    }

    static getAllIds(): EScopeOfObligationId[] {
        return (this.getAllAvailables() as ScopeOfObligation[]).map(x => x.id as EScopeOfObligationId);
    }

    private constructor(
        protected __id: EScopeOfObligationId,
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
