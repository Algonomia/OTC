import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, Type} from '@angular/core';
import {ComponentRendererComponent} from '../../plugs/cell-like-renderer/component-renderer.component';
import {BaseMetaCompMap, MetaFormControl} from '../metaforms';
import {stdCompMap} from '../stc-comp-map';
import {EValidatorType} from '@algonomia/ts-shared';

@Component({
    selector: 'app-meta-form-control',
    imports: [
        ComponentRendererComponent
    ],
    templateUrl: './meta-form-control.component.html',
    styleUrl: './meta-form-control.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetaFormControlComponent implements OnChanges {
    @Input() metaFormControl!: MetaFormControl<any, any>;
    @Input() compMap: BaseMetaCompMap = stdCompMap;

    constructor(private _cd: ChangeDetectorRef) {}

    protected __component?: Type<unknown>
    protected __renderInput = (x: MetaFormControl<any, any>) => ({formControl: x});

    ngOnChanges() {
        const validatorType = this.metaFormControl?.algoValidator?.validator_type ?? EValidatorType.text;
        this.__component = this.compMap[validatorType];
        this._cd.markForCheck();
    }
}
