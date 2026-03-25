import {
    ComplexValueUtils,
    EBaseTypes,
    EValueType, TComplexValue, TConstantValue,
    IOperationValue, ITag, ITagValue, OperatorExt
} from '@algonomia/ts-shared';
import {ESelectionMode, SelectHandler} from '../../../../../handlers/select-handler/select-handler';
import {TagUtils} from '@algonomia/ts-shared';

export class CreatePrimitiveComplexValueMenuDelegate {

    constructor(public readonly TAG_LIST: ITag[], public readonly potentiel_outputs: (EBaseTypes | null)[] = []) {}

    createComplexValueSelectHandler(selectionMode: ESelectionMode) {
        const menu: Partial<TComplexValue>[] = [...this._getOperationsMenu(), ...this._getTagsMenu(), ...this._getConstantMenu()]
        switch (selectionMode) {
            case ESelectionMode.none: return SelectHandler.getFakeSelectHandlerForEncapsulation(menu, this._idCallBack, this._titleCallBack);
            case ESelectionMode.single: return SelectHandler.getMonoSelectHandler(menu, [], [], this._idCallBack, this._titleCallBack);
            case ESelectionMode.multiple: return SelectHandler.getMultiSelectHandler(menu, [], [], this._idCallBack, this._titleCallBack);
        }
    }

    private _idCallBack = ((x: Partial<TComplexValue>) => {
        if (!x.type) {
            return '';
        }
        return CreatePrimitiveComplexValueMenuDelegate._primitiveComplexValueGetIdCallback[x.type](x);
    });

    private _titleCallBack = ((x: Partial<TComplexValue>) => {
        if (!x.type) {
            return '';
        }
        return CreatePrimitiveComplexValueMenuDelegate._primitiveComplexValueGetTitleCallback[x.type](x, this.TAG_LIST);
    });

    private _getOperationsMenu(): Partial<IOperationValue>[] {
        return OperatorExt.getAllNonIdentityOperators().filter(
            x =>
                this.potentiel_outputs.length === 0 ||
                this.potentiel_outputs.includes(null) ||
                (x.expectedOutput instanceof Function) ||
                this.potentiel_outputs.includes(x.expectedOutput)
        ).map(op => ({type: EValueType.Operation, operator_id: op.operatorId}));
    }
    private _getTagsMenu(): Partial<ITagValue>[] {
        return this.TAG_LIST.map(x => ({type: EValueType.Tag, value: x.code, expected_type: x.expected_type})).filter(
            x =>
                this.potentiel_outputs.length === 0 ||
                this.potentiel_outputs.includes(null) ||
                this.potentiel_outputs.includes(x.expected_type)
        ) as Partial<ITagValue>[];
    }
    private _getConstantMenu(): Partial<TConstantValue>[] {
        return [
            {type: EValueType.Constant, expected_type: EBaseTypes.Numeric},
            {type: EValueType.Constant, expected_type: EBaseTypes.String},
            {type: EValueType.Constant, expected_type: EBaseTypes.Boolean},
            {type: EValueType.Constant, expected_type: EBaseTypes.Date},
            {type: EValueType.Constant, expected_type: EBaseTypes.Period},
            {type: EValueType.Constant, expected_type: EBaseTypes.DayMonth}
        ].filter(
            x =>
                this.potentiel_outputs.length === 0 ||
                this.potentiel_outputs.includes(null) ||
                this.potentiel_outputs.includes(x.expected_type)
        ) as Partial<TConstantValue>[];
    }

    private static _primitiveComplexValueGetIdCallback: {[key in EValueType]: ((value: Partial<TComplexValue>) => string)} = {
        [EValueType.Operation]:((value: Partial<TComplexValue>) => {
            const operator_id = (value as IOperationValue)?.operator_id;
            return [value.type, operator_id].join('$$$');
        }),
        [EValueType.Tag]: ((value: Partial<TComplexValue>) => {
            const expected_type = (value as ITagValue)?.expected_type;
            const tagValue = (value as ITagValue)?.value;
            return [value.type, expected_type, tagValue].join('$$$');
        }),
        [EValueType.Constant]: ((value: Partial<TComplexValue>) => {
            const expected_type = (value as TConstantValue).expected_type;
            return [value.type, expected_type].join('$$$');
        })
    }

    private static _primitiveComplexValueGetTitleCallback: {[key in EValueType]: ((value: Partial<TComplexValue>, tagList: ITag[]) => string)} = {
        [EValueType.Operation]:((value: Partial<TComplexValue>) => {
            const operator_id = (value as IOperationValue)?.operator_id;
            return OperatorExt.getTitle(operator_id) ?? ''
        }),
        [EValueType.Tag]: ((value: Partial<TComplexValue>, tagList: ITag[] = []) => {
            const code = (value as ITagValue)?.value;
            const tagViewValue = TagUtils.getViewValueFromCode(tagList, code);
            return tagViewValue ?? code ?? '';
        }),
        [EValueType.Constant]: ((value: Partial<TComplexValue>) => {
            const expected_type = (value as TConstantValue).expected_type;
            return ComplexValueUtils.baseTypeTitle[expected_type];
        })
    }
}

