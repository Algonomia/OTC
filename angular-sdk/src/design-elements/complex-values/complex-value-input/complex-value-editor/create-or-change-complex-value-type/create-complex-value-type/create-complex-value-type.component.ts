import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, Input, OnInit} from '@angular/core';
import {
    EBaseTypes,
    EValueType,
    TComplexValue, IOperationValue, ITag
} from '@algonomia/ts-shared';
import {ATemplateComponent} from '../../../../../../templates/template-component.abstract';
import {StdMenuComponent} from '../../../../../menus/std-menu/std-menu.component';
import {CreatePrimitiveComplexValueMenuDelegate} from '../create-primitive-complex-value-menu.delegate';
import {PrimitiveComplexValueSegmenter} from '../primitive-complex-value-segmenter.class';
import {ESelectionMode, SelectHandler} from '../../../../../../handlers/select-handler/select-handler';
import {ButtonAddComponent} from '../../../../../buttons/buttons/button-add/button-add.component';
import {toObservable} from '@angular/core/rxjs-interop';
import {switchMap, tap} from 'rxjs';

@Component({
    selector: 'app-create-complex-value-type',
    imports: [StdMenuComponent, ButtonAddComponent],
    templateUrl: './create-complex-value-type.component.html',
    styleUrl: './create-complex-value-type.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class CreateComplexValueTypeComponent extends ATemplateComponent implements OnInit {
    @Input() TAG_LIST: ITag[] = [];
    potentiel_outputs = input<(EBaseTypes | null)[]>();
    potentiel_outputs$ = toObservable(this.potentiel_outputs);
    @Input() parentComplexValue!: IOperationValue;

    protected __complexValueSelectHandler!: SelectHandler<Partial<TComplexValue>, string>;
    protected __segmenter = new PrimitiveComplexValueSegmenter();

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this.potentiel_outputs$).pipe(
            tap(potentiel_outputs => {
                this.__complexValueSelectHandler = new CreatePrimitiveComplexValueMenuDelegate(
                    this.TAG_LIST, potentiel_outputs
                ).createComplexValueSelectHandler(ESelectionMode.none);
                this._cd.markForCheck();
            }),
            switchMap(_ => this.__complexValueSelectHandler.selectionAttempt$)
        ).subscribe(selected => {
            const newComplexValue = this.getNewComplexValue(selected[0]);
            if (!this.parentComplexValue.args) {
                this.parentComplexValue.args = [];
            }
            this.parentComplexValue.args?.push(newComplexValue as TComplexValue);
            this._cd.markForCheck();
        });
    }

    getNewComplexValue(primitiveComplexValue: Partial<TComplexValue>) {
        const newComplexValue = {...primitiveComplexValue};
        if (newComplexValue?.type === EValueType.Operation) {
            newComplexValue.args = [];
        }
        return newComplexValue;
    }
}
