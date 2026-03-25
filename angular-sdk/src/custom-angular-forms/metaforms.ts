import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {AValidator, BaseMeta, EValidatorType, ValidatorGroup} from '@algonomia/ts-shared';
import {Type} from '@angular/core';

export type BaseMetaCompMap = {[key in EValidatorType]: Type<unknown>};

export class MetaFormControl<T, M extends BaseMeta> extends FormControl<T | null> {
    constructor(
        public readonly algoValidator: AValidator<T, M>,
        initial: T | null = null
    ) {
        const controls = algoValidator.errorCallbacks.map(errorCallback => {
            return ((control: AbstractControl) => {
                return errorCallback(control?.value);
            });
        });
        super(initial, { validators: controls, updateOn: 'blur' });
    }
}

export class MetaFormGroup<
    T extends Record<string, MetaFormControl<any, BaseMeta>> = any
> extends FormGroup<T> {
    static createFromValidatorGroup<T extends Record<string, any>>(validator: ValidatorGroup<T>, initialValues: Partial<{[k in keyof T]: any}> = {}): MetaFormGroup<{[k in keyof T]: MetaFormControl<any, BaseMeta>}> {
        const validatorMap = validator.validatorMap;
        const keys = Object.keys(validatorMap);
        const controls: {[key in keyof T]: MetaFormControl<any, BaseMeta>} = Object.fromEntries(
            keys.map((k: keyof T) => {
                const metaFormControl = validatorMap[k] ? new MetaFormControl(validatorMap[k], initialValues[k]) : undefined;
                return [k, metaFormControl];
            }).filter(x => x[1] !== null && x[1] !== undefined)
        );
        return new MetaFormGroup(controls);
    }
}
