type _TEnhancedEnumId = string | number;
type _TClassId = number;

export abstract class AEnhancedEnumFactory<ID = _TEnhancedEnumId> {
    protected static __classIdCounter = 0;
    private static _classId: _TClassId;
    private static _getOrCreateKey(): _TClassId {
        if (this._classId === undefined) {
            this._classId = ++AEnhancedEnumFactory.__classIdCounter;
        }
        return this._classId;
    }

    private static _availableEnhancedEnumsMap: Map<_TClassId, unknown[]> = new Map();

    private static get _availableEnhancedEnums(): AEnhancedEnumFactory[] {
        const classId = this._classId;
        return (this._availableEnhancedEnumsMap?.get(classId) ?? []) as AEnhancedEnumFactory[];
    }

    static getByIdOrId<ID>(id: ID | undefined) {
        return this.getById(id) ?? id;
    }

    static getById<ID>(id: ID | undefined) {
        return this._availableEnhancedEnums.find(x => x.__id === id);
    }

    static getByTag(tag: unknown) {
        return this._availableEnhancedEnums.filter(x =>
            x.__tags.some((xTag: unknown) => xTag === tag)
        );
    }

    static getByTagsAnd(tags: unknown[]) {
        return this._availableEnhancedEnums.filter(
            x => tags.every(tag => x.__tags.some((xTag: unknown) => xTag === tag))
        );
    }

    static findByTagAnd(tags: unknown[]) {
        return this._availableEnhancedEnums.find(
            x => tags.every(tag => x.__tags.some((xTag: unknown) => xTag === tag))
        );
    }

    static getByTagsOr(tags: unknown[]) {
        return this._availableEnhancedEnums.filter(x =>
            x.__tags.some((xTag: unknown) => tags.some(tag => xTag === tag))
        );
    }

    static getAllAvailables() {
        return [...this._availableEnhancedEnums];
    }

    protected __id: ID;
    protected __tags: unknown[];

    protected constructor(_id: ID, _tags: unknown[] = []) {
        this.__id = _id;
        this.__tags = _tags;
        const classId = (this.constructor as typeof AEnhancedEnumFactory)._getOrCreateKey();
        try {
            const availableElements = AEnhancedEnumFactory._availableEnhancedEnumsMap.get(classId) as AEnhancedEnumFactory[] | undefined;
            const hasIdAlready = !!availableElements?.some(x => x.__id === _id);
            if (hasIdAlready) {
                throw new Error('Id ' + _id + ' already exists');
            }
        } catch (error: unknown) {
            console.error({message: (error as Error)?.message});
            return;
        }
        if (AEnhancedEnumFactory._availableEnhancedEnumsMap.has(classId)) {
            AEnhancedEnumFactory._availableEnhancedEnumsMap.get(classId)?.push(this);
        } else {
            AEnhancedEnumFactory._availableEnhancedEnumsMap.set(classId, [this]);
        }
    }

    get id() {
        return this.__id;
    }
}
