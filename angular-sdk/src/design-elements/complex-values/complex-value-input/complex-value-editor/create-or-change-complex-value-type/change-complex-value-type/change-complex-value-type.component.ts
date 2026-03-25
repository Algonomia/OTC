import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, input, OnInit} from '@angular/core';
import {
    EBaseTypes,
    EValueType,
    TComplexValue,
    ITag,
    OperatorExt,
    EOperatorId
} from '@algonomia/ts-shared';
import {toObservable} from '@angular/core/rxjs-interop';
import {Observable, of, skip, switchMap, tap} from 'rxjs';
import {ATemplateComponent} from '../../../../../../templates/template-component.abstract';
import {StdMenuComponent} from '../../../../../menus/std-menu/std-menu.component';
import {CreatePrimitiveComplexValueMenuDelegate} from '../create-primitive-complex-value-menu.delegate';
import {PrimitiveComplexValueSegmenter} from '../primitive-complex-value-segmenter.class';
import {ESelectionMode, SelectHandler} from '../../../../../../handlers/select-handler/select-handler';

@Component({
    selector: 'app-change-complex-value-type',
    imports: [StdMenuComponent],
    templateUrl: './change-complex-value-type.component.html',
    styleUrl: './change-complex-value-type.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ChangeComplexValueTypeComponent extends ATemplateComponent implements OnInit {
    @Input() TAG_LIST: ITag[] = [];
    complexValue = input<Partial<TComplexValue>>({});
    complexValue$ = toObservable(this.complexValue);
    potential_outputs = input<(EBaseTypes | null)[]>();
    potential_outputs$ = toObservable(this.potential_outputs);

    protected __complexValueSelectHandler!: SelectHandler<Partial<TComplexValue>, string>;
    protected __segmenter = new PrimitiveComplexValueSegmenter();
    protected __selectedSymbol: string = '';
    protected __selectedTitle$: Observable<string | undefined> = of('');

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this.complexValue$).pipe(
            switchMap(_ => this.potential_outputs$),
            tap(_ => {
                const complexValue = this.complexValue();
                const potential_outputs = this.potential_outputs();
                this.__complexValueSelectHandler = new CreatePrimitiveComplexValueMenuDelegate(
                    this.TAG_LIST, potential_outputs
                ).createComplexValueSelectHandler(ESelectionMode.single);
                const selected = this.__complexValueSelectHandler.list.find(x => Object.entries(x).every(([key, value]) => {
                    return value === (complexValue as any)[key];
                }));
                if (!selected) {
                    this.__complexValueSelectHandler.removeAll();
                } else {
                    this.__complexValueSelectHandler.add(selected);
                }
                this.__selectedTitle$ = this.__complexValueSelectHandler?.firstSelectedDisplayValue$;
                this._cd.markForCheck();
            }),
            switchMap(_ => this.__complexValueSelectHandler.firstSelected$),
            tap((selected) => {
                let operatorId: string | undefined;
                if (selected?.type === EValueType.Operation) {
                    operatorId = selected?.operator_id;
                }
                this.__selectedSymbol = OperatorExt.getSymbol(operatorId);
                this._cd.markForCheck();
            }),
            skip(1)
        ).subscribe(selected => {
            const complexValueRef = this.complexValue();
            const newComplexValue: Partial<TComplexValue> = {};
            Object.assign(newComplexValue, selected ?? {});
            if (newComplexValue?.type === EValueType.Operation) {
                const operator = newComplexValue.operator_id as EOperatorId;
                const minMaxOperations = OperatorExt.getMinMaxArgs(operator);
                const args = (complexValueRef as any)?.args ? [...(complexValueRef as any).args] : [];
                newComplexValue.args = args.length > (minMaxOperations.max_args ?? Infinity) ? args.slice(0, minMaxOperations.max_args) : args;
            }
            Object.keys(complexValueRef).forEach(k => {
                delete (complexValueRef as any)[k];
            });
            Object.assign(complexValueRef, newComplexValue);
            this._cd.markForCheck();
        });
    }
}
