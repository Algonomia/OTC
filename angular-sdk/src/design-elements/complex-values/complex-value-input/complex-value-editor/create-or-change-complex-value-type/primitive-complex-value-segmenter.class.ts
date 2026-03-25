import {
    AGrouper, ComplexValueUtils,
    EValueType,
    TComplexValue,
    IOperationValue,
    ITagValue,
    OperatorExt
} from '@algonomia/ts-shared';

export class PrimitiveComplexValueSegmenter extends AGrouper<Partial<TComplexValue>, string[], string[]> {
    protected __getGrouping(value: TComplexValue): string[] {
        return PrimitiveComplexValueSegmenter._segmentationPerType[value.type](value);
    }
    protected __getKeys(value: TComplexValue): string[][] {
        return PrimitiveComplexValueSegmenter._keysPerType[value.type](value);
    }

    private static _segmentationPerType: {[key in EValueType]: (value: TComplexValue) => string[]} = {
        [EValueType.Operation]: (value: TComplexValue) => {
            const typeTitle = ComplexValueUtils.valueTypeTitle[value.type];
            const operator_id = (value as IOperationValue).operator_id;
            const operatorExt: OperatorExt = OperatorExt.getById(operator_id) as OperatorExt;
            return [typeTitle, operatorExt.groupTitle ?? ''];
        },
        [EValueType.Tag]: (value: TComplexValue) => {
            const typeTitle = ComplexValueUtils.valueTypeTitle[value.type];
            const expected_type = ComplexValueUtils.baseTypeTitle[(value as ITagValue).expected_type];
            return [typeTitle, expected_type];
        },
        [EValueType.Constant]: (value: TComplexValue) => {
            const typeTitle = ComplexValueUtils.valueTypeTitle[value.type];
            return [typeTitle];
        }
    }

    private static _keysPerType: {[key in EValueType]: (value: TComplexValue) => string[][]} = {
        [EValueType.Operation]: (value: TComplexValue) => {
            return [this._segmentationPerType[value.type](value)];
        },
        [EValueType.Tag]: (value: TComplexValue) => {
            return [this._segmentationPerType[value.type](value)];
        },
        [EValueType.Constant]: (value: TComplexValue) => {
            return [this._segmentationPerType[value.type](value)];
        },
    }
}
