import {ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit} from '@angular/core';
import {MetaFormControl} from '../../metaforms';
import {TJsonObject, NullUndefinedUtils, ObjectMeta} from '@algonomia/ts-shared';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {MultiMetaFormControlComponent} from '../../multi-meta-form-control/multi-meta-form-control.component';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Component({
    selector: 'app-field-object',
    templateUrl: './field-object.component.html',
    styleUrl: './field-object.component.css',
    standalone: true,
    imports: [
        forwardRef(() => MultiMetaFormControlComponent)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldObjectComponent extends ATemplateComponent implements OnInit {
    @Input() formControl!: MetaFormControl<TJsonObject | null, ObjectMeta>;
    protected __metaFormControls: MetaFormControl<any, any>[] = [];

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        const keyValidatorEntries = Array.from(this.formControl.algoValidator.meta.mapKeyValidator.entries());
        this.__metaFormControls = keyValidatorEntries.map(([key, validator]) => {
            const initialValue = this.formControl.value ? (this.formControl.value[key] ?? null) : null;
            return new MetaFormControl(validator, initialValue);
        });
        this.__metaFormControls.forEach((x, i) => {
            const key = keyValidatorEntries[i][0];
            this.pipeTakeUntil(x.valueChanges).subscribe(x => {
                let copy = this.formControl.value;
                if (copy === null && !isNullOrUndefined(x)) {
                    copy = {[key]: x};
                } else if (copy !== null && isNullOrUndefined(x)) {
                    delete copy[key];
                } else {
                    copy = {...this.formControl.value, [key]: x};
                }
                if (JSON.stringify(copy) === '{}') {
                    copy = null;
                }
                this.formControl.setValue(copy);
                this.formControl.markAllAsTouched();
                this._cd.markForCheck();
            });
        });
        this._cd.markForCheck();
    }
}
