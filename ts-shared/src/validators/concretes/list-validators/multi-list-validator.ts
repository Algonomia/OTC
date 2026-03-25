import {AValidator} from '../../validators.abstract';
import {ListMeta, listValueRequired, restrictToList} from './common';
import {NullUndefinedUtils} from '../../../utils/null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {EValidatorType} from '../../EValidatorType';

export class AlgoMultiListValidator<T, ID> extends AValidator<T[] | T | null, ListMeta<T, ID>> {
    readonly validator_type = EValidatorType.multi_qcm;

    constructor(meta: ListMeta<T, ID> = {list: []}) {
        super(meta);
        if (meta.required) {
            this.errorCallbacks.push(listValueRequired);
        }
        if (meta.minLength) {
            this.errorCallbacks.push(_minLength.bind(this, meta.minLength));
        }
        if (meta.maxLength) {
            this.errorCallbacks.push(_maxLength.bind(this, meta.maxLength));
        }
        this.errorCallbacks.push(restrictToList.bind(this, meta.list as T[]));
    }
}

function _minLength<T>(minLength: number, value?: T | T[] | null): null | {minlength: {requiredLength: number, actualLength: number}} {
    if (isNullOrUndefined(value)) {
        return null;
    }
    if (!value || (Array.isArray(value) && value.length < minLength)) {
        return {
            minlength: {requiredLength: minLength, actualLength: (Array.isArray(value) ? value.length : 0)}
        }
    }
    return null
}

function _maxLength<T>(maxLength: number, value?: T | T[] | null): null | {maxlength: {requiredLength: number, actualLength: number}} {
    if (isNullOrUndefined(value)) {
        return null;
    }
    if (!value || (Array.isArray(value) && value.length > maxLength)) {
        return {
            maxlength: {requiredLength: maxLength, actualLength: (Array.isArray(value) ? value.length : 0)}
        }
    }
    return null
}
