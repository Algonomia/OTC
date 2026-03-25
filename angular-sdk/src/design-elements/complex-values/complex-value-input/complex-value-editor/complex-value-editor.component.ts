import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed, Input,
    input,
    effect,
    output,
    Pipe,
    PipeTransform, DoCheck, OnInit
} from '@angular/core';
import {
    AlgoComplexValueValidator,
    ComplexValueUtils, EBaseTypes,
    EValueType,
    TComplexValue,
    IOperationValue, IScope, ITag,
    ObjectUtils,
    OperatorExt
} from '@algonomia/ts-shared';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {EOperatorId} from '@algonomia/ts-shared';
import {FormsModule} from '@angular/forms';
import {EditConstantNumericComponent} from './edit-constant-numeric/edit-constant-numeric.component';
import {EditTagComponent} from './edit-tag/edit-tag.component';
import {DragDropModule} from 'primeng/dragdrop';
import {AlgoIconComponent} from '../../../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';
import {ChangeComplexValueTypeComponent} from './create-or-change-complex-value-type/change-complex-value-type/change-complex-value-type.component';
import {CreateComplexValueTypeComponent} from './create-or-change-complex-value-type/create-complex-value-type/create-complex-value-type.component';
import {EditConstantStringComponent} from './edit-constant-string/edit-constant-string.component';
import {EditConstantBooleanComponent} from './edit-constant-boolean/edit-constant-boolean.component';
import {EditConstantDateComponent} from './edit-constant-date/edit-constant-date.component';
import {EditConstantPeriodComponent} from './edit-constant-period/edit-constant-period.component';
import {DisplayComplexValuePipe} from '../../../../pipes/display-complex-value.pipe';
import {TJsonValue} from '@algonomia/ts-shared';
import {EditConstantDayMonthComponent} from './edit-constant-day-month/edit-constant-day-month.component';
import {MapHasPipe} from '../../../../pipes/map-has.pipe';
import {
    FormControlErrorsTooltipComponent
} from '../../../form-controls/common/form-control-errors-tooltip/form-control-errors-tooltip.component';
import {ToggleComponent} from '../../../../global-components/toggle/toggle.component';
import {SelectionState} from '../../../../handlers/select-handler/select-handler';
import {SetHasPipe} from '../../../../pipes/set-has.pipe';
import {ScreenSize, WidthHeightListenerService} from '../../../../global-services/width-height-listener.service';
import {ATemplateComponent} from '../../../../templates/template-component.abstract';
import {ValidatorError} from '@algonomia/ts-shared';

@Pipe({
    name: 'operatorMinMax',
    standalone: true
})
export class OperatorMinMaxPipe implements PipeTransform {
    constructor() {}

    transform(operationId: EOperatorId) {
        return OperatorExt.getMinMaxArgs(operationId);
    }
}

@Pipe({
    name: 'operatorTitle',
    standalone: true
})
export class OperatorTitlePipe implements PipeTransform {
    constructor() {}

    transform(operationId: EOperatorId) {
        return OperatorExt.getTitle(operationId);
    }
}

@Pipe({
    name: 'expectedOutput',
    standalone: true
})
export class ComplexValueExpectedOutputPipe implements PipeTransform {
    constructor() {}

    transform(complexValue: TComplexValue, expected_output: EBaseTypes | null) {
        return ComplexValueUtils.complexValueExpectedOutput(complexValue, expected_output);
    }
}

@Pipe({
    name: 'expectedInputs',
    standalone: true
})
export class OperatorExpectedInputs implements PipeTransform {
    constructor() {}

    transform(operationValue: IOperationValue, expected_output: EBaseTypes | null) {
        return ComplexValueUtils.operatorValueExpectedInputs(operationValue, expected_output);
    }
}

@Pipe({
    name: 'possibleNextInputs',
    standalone: true
})
export class OperatorPossibleNextInputs implements PipeTransform {
    constructor() {}

    transform(operationValue: IOperationValue, expected_output: EBaseTypes | null) {
        return ComplexValueUtils.operatorValuePossibleNextInputs(operationValue, expected_output);
    }
}

@Component({
    selector: 'app-complex-value-editor',
    imports: [
        NgTemplateOutlet,
        OperatorMinMaxPipe,
        FormsModule,
        EditConstantNumericComponent,
        EditTagComponent,
        DragDropModule,
        AlgoIconComponent,
        TranslatePipe,
        ChangeComplexValueTypeComponent,
        CreateComplexValueTypeComponent,
        EditConstantStringComponent,
        DisplayComplexValuePipe,
        EditConstantBooleanComponent,
        EditConstantDateComponent,
        EditConstantPeriodComponent,
        ComplexValueExpectedOutputPipe,
        OperatorExpectedInputs,
        OperatorPossibleNextInputs,
        EditConstantDayMonthComponent,
        MapHasPipe,
        FormControlErrorsTooltipComponent,
        ToggleComponent,
        NgClass,
        SetHasPipe,
    ],
    templateUrl: './complex-value-editor.component.html',
    styleUrl: './complex-value-editor.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplexValueEditorComponent extends ATemplateComponent implements OnInit, DoCheck {
    @Input() TAG_LIST: ITag[] = [];
    @Input() SCOPE_LIST: IScope[] = [];
    @Input() expected_type: EBaseTypes | null = null;
    complexValue = input<TComplexValue | null | undefined>();
    normalizedComplexValue = computed<IOperationValue>(() => {
        const input = this.complexValue();
        const copy = ObjectUtils.deepCopy(input as TJsonValue) as TComplexValue | null;
        return {
            type: EValueType.Operation,
            operator_id: EOperatorId.Identity,
            args: [copy ?? []].flat(1)
        };
    });
    outputComplexValue = output<TComplexValue | null>();

    protected readonly Array = Array;
    protected readonly Math = Math;

    protected __nestedErrorMap: Map<TComplexValue, ValidatorError> = new Map();

    private _previousValueSnapshot: string = '';

    public modeAccordion: boolean = false;

    ngOnInit() {
        this.pipeTakeUntil(WidthHeightListenerService.windowScreenListener).subscribe(x => {
            if (x === ScreenSize.small) {
                this.modeAccordion = true;
                this._setChildrenReadMode();
                this._cd.markForCheck();
            }
        });
    }

    private _setChildrenReadMode() {
        const firstComplexValue = this.normalizedComplexValue().args[0];

        if (firstComplexValue) {
            this.__readModeSet = this._collectAllComplexValues(firstComplexValue, true);
        }
    }

    private _collectAllComplexValues(complexValue: TComplexValue, isRoot: boolean = false): Set<TComplexValue> {
        const result = new Set<TComplexValue>();

        if (!isRoot) {
            result.add(complexValue);
        }

        if (complexValue.type === EValueType.Operation && complexValue.args) {
            for (const arg of complexValue.args) {
                const nestedValues = this._collectAllComplexValues(arg);
                nestedValues.forEach(value => result.add(value));
            }
        }

        return result;
    }

    ngDoCheck() {
        const output = this.normalizedComplexValue().args[0];
        const currentSnapshot = JSON.stringify(output);
        if (currentSnapshot !== this._previousValueSnapshot) {
            this._previousValueSnapshot = currentSnapshot;
            const validator = new AlgoComplexValueValidator(
                {tag_list: this.TAG_LIST, expected_output: this.expected_type}
            );
            this.__nestedErrorMap = validator.getNestedErrorsMap(output);
            this.outputComplexValue.emit(output);
            this._cd.markForCheck();
        }
    }

    constructor(private _cd: ChangeDetectorRef) {
        super();
        effect(() => {
            const value = this.normalizedComplexValue().args[0] ?? null;
            this.outputComplexValue.emit(value);
        });
    }

    protected draggedItem: TComplexValue | null = null;
    protected draggedParent: IOperationValue | null = null;

    protected __onDragStart(event: any, parent_item: any, item: any): void {
        this.draggedItem = item;
        this.draggedParent = parent_item;
    }

    protected __onDragEnd(event: any): void {
        this.draggedItem = null;
        this.draggedParent = null;
    }

    protected __onDropBetween(event: any, targetOperation: IOperationValue, followingElement?: TComplexValue): void {
        if (!this.draggedParent || !this.draggedItem) {
            return;
        }
        if (this._valueContainsOperation(this.draggedItem, targetOperation)) {
            return;
        }
        const idxInOriginalArray = this.draggedParent.args.indexOf(this.draggedItem);
        this.draggedParent.args.splice(idxInOriginalArray, 1);
        if (!!followingElement) {
            const followingElementIdx = targetOperation.args.indexOf(followingElement);
            const leftArgs = targetOperation.args.slice(0, followingElementIdx);
            const rightArgs = targetOperation.args.slice(followingElementIdx);
            targetOperation.args = [...leftArgs, this.draggedItem, ...rightArgs];
        } else {
            targetOperation.args = [...targetOperation.args, this.draggedItem];
        }
        this._cd.markForCheck();
    }

    protected __onDropToEmpty(event: any, targetOperation: IOperationValue): void {
        if (!this.draggedItem) {
            return;
        }
        const copy = ObjectUtils.deepCopy(this.draggedItem as any);
        targetOperation.args = [...targetOperation.args, copy];
        this._cd.markForCheck();
    }

    private _valueContainsOperation(draggedItem: TComplexValue, targetParent: IOperationValue): boolean {
        if (draggedItem.type !== EValueType.Operation) {
            return false;
        }
        if (targetParent === draggedItem) {
            return true;
        }
        const operationArgs = draggedItem?.args?.filter(x => x.type === 'operation');
        if (operationArgs?.length === 0) {
            return false;
        }
        return operationArgs.some(arg => this._valueContainsOperation(draggedItem, arg));
    }

    protected __removeValue(parent_value: IOperationValue, complexValue: any) {
        const toDeleteIdx = parent_value.args.indexOf(complexValue);
        parent_value.args.splice(toDeleteIdx, 1);
        this._cd.markForCheck();
    }

    protected __readModeSet = new Set<TComplexValue>();
    protected __switchReadMode(complexValue: TComplexValue) {
        const newReadModeSet = new Set([...this.__readModeSet]);

        if (newReadModeSet.has(complexValue)) {
            newReadModeSet.delete(complexValue);
        } else {
            newReadModeSet.add(complexValue);
        }
        this.__readModeSet = newReadModeSet;
        this._cd.markForCheck();
    }

    public changeModeAccordion() {
        this.modeAccordion = !this.modeAccordion;
    }

    protected readonly SelectionState = SelectionState;
}
