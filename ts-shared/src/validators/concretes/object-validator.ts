import {TJsonObject, ZJsonObject} from '../../interface/json-object.type';
import {AValidator, BaseMeta} from '../validators.abstract';
import {EValidatorType} from '../EValidatorType';

export interface ObjectMeta extends BaseMeta {
    mapKeyValidator: Map<any, AValidator<any, any>>;
    mandatoryKeys?: any[];
    mapKeyTitles?: Map<any, string>;
}

export class AlgoObjectValidator extends AValidator<TJsonObject | null, ObjectMeta> {
    readonly validator_type = EValidatorType.object;

    constructor(meta: ObjectMeta = {mapKeyValidator: new Map()}) {
        super(meta);
        this.errorCallbacks.push(_isValidObject);
        this.errorCallbacks.push(_checkUnauthorizedKeys.bind(this, meta.mapKeyValidator));
        this.errorCallbacks.push(_checkMissingKeys.bind(this, meta.mandatoryKeys));
        this.errorCallbacks.push(_checkValues.bind(this, meta.mapKeyValidator));
        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
    }
}

function _valueRequired(value?: TJsonObject | null): null | {required: boolean} {
    if (!value) return {
        required: true
    };
    return null
}

function _isValidObject(value?: TJsonObject | null) {
    if (!value) {
        return null;
    }
    try {
        ZJsonObject.parse(value)
        return null;
    } catch (e) {
        return {invalidObject: true};
    }
}

function _checkUnauthorizedKeys(mapKeyValidator: Map<any, AValidator<any, any>>, value?: TJsonObject | null) {
    if (!value) {
        return null;
    }
    try {
        const keys = Array.from(Object.keys(value));
        const expectedKeys = Array.from(mapKeyValidator.keys());
        const unauthorizedKeys = keys.filter(x => !expectedKeys.includes(x));

        if (unauthorizedKeys.length === 0) {
            return null;
        }

        return {unauthorizedKeys: {unauthorizedKeys}};
    } catch (e) {
        return null;
    }
}

function _checkMissingKeys(mandatoryKeys?: any[], value?: TJsonObject | null) {
    if (!value || !mandatoryKeys?.length) {
        return null;
    }
    try {
        const keys = Array.from(Object.keys(value));
        const missingKeys = mandatoryKeys.filter(x => !keys.includes(x));

        if (missingKeys.length === 0) {
            return null;
        }

        return {missingKeys: {missingKeys}};
    } catch (e) {
        return null;
    }
}

function _checkValues(mapKeyValidator: Map<any, AValidator<any, any>>, value?: TJsonObject | null) {
    if (!value) {
        return null;
    }
    try {
        const entries = Array.from(mapKeyValidator.entries());
        entries.forEach(([key, validator]) => {
            const errors = validator.checkErrors(value[key]);
            if (errors.length > 0) {
                return {invalidValues: true};
            }
        });
        return null;
    } catch (e) {
        return null;
    }
}
