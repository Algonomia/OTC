import {EValidatorErrors} from './errors.abstract';
import {EValidatorType} from './EValidatorType';

export interface BaseMeta {
    label?: string;
    placeholder?: string;
    hint?: string;
    required?: boolean;
}

export interface BasicErrorChecker<T> {
    checkErrors: (x?: T) => ValidatorError[] | [string, ValidatorError[]][]
}

export type ValidatorError = Partial<{[key in EValidatorErrors]: any}> | null;
export abstract class AValidator<T, M extends BaseMeta> implements BasicErrorChecker<T> {
    abstract readonly validator_type: EValidatorType;

    errorCallbacks: ((x?: T) => ValidatorError)[] = [];
    constructor(readonly meta: M) {}

    checkErrors(x?: T) {
        return this.errorCallbacks.map(callback => callback(x)).filter(x => !!x);
    }
}

type TValidatorMap<T extends Record<string, any>> = {
    [K in keyof T]?: AValidator<T[K], any>;
};

export class ValidatorGroup<T extends Record<string, any>> implements BasicErrorChecker<T> {
    static createFromValidatorGroup<S extends Record<string, any>>(...validatorGroups: ValidatorGroup<S>[]) {
        return new ValidatorGroup<S>(...validatorGroups.map(x => x.validatorMap))
    }

    private _validatorMap: TValidatorMap<T> = {};

    constructor(...validatorMaps: TValidatorMap<T>[]) {
        validatorMaps.forEach(map => {
            (Object.entries(map) as [keyof T, AValidator<T[keyof T], any>][]).forEach(([key, value]) => {
                this._validatorMap[key] = value;
            });
        });
    }

    get validatorMap(): TValidatorMap<T> {
        return {...this._validatorMap};
    }

    checkErrors(keyValues?: T) {
        const errors: [string, ValidatorError[]][] = [];
        for (const key in this._validatorMap) {
            const validator = this._validatorMap[key];
            const value = keyValues ? keyValues[key] : undefined;
            const errs = validator?.checkErrors(value) ?? [];
            if (errs.length > 0) {
                errors.push([key, errs]);
            }
        }
        return errors;
    }
}
