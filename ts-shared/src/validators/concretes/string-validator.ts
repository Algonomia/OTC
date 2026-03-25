import {AValidator, BaseMeta} from '../validators.abstract';
import {NullUndefinedUtils} from '../../utils/null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {EValidatorType} from '../EValidatorType';

export interface StringMeta extends BaseMeta {
    minLength?: number;
    maxLength?: number;
    isUrl?: boolean;
    isEmail?: boolean;
    isPhone?: boolean;
}

export class AlgoStringValidator extends AValidator<string | null, StringMeta> {
    readonly validator_type = EValidatorType.text;

    constructor(meta: StringMeta = {}) {
        super(meta);

        if (meta.required) {
            this.errorCallbacks.push(_valueRequired);
        }
        if (!isNullOrUndefined(meta.minLength)) {
            this.errorCallbacks.push(_minLength.bind(this, meta.minLength!));
        }
        if (!isNullOrUndefined(meta.maxLength)) {
            this.errorCallbacks.push(_maxLength.bind(this, meta.maxLength!));
        }
        if (meta.isUrl) {
            this.errorCallbacks.push(_urlValidator.bind(this, []));
        }
        if (meta.isEmail) {
            this.errorCallbacks.push(_emailValidator);
        }
        if (meta.isPhone) {
            this.errorCallbacks.push(_phoneValidator);
        }
    }
}

const _defaultProtocol = 'https://';
function _urlValidator(allowedHosts: string[] = [], value?: string | null): null | {wrongUrl: boolean} {
    let raw = value?.trim();
    if (!raw) return null;

    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) {
        raw = _defaultProtocol + raw;
    }

    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return { wrongUrl: true };
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { wrongUrl: true };
    }

    if (allowedHosts.length && !allowedHosts.includes(parsed.hostname)) {
        return { wrongUrl: true };
    }

    const privateIpPatterns = [
        /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./
    ];
    if (privateIpPatterns.some(p => p.test(parsed.hostname))) {
        return { wrongUrl: true };
    }

    return null;
}

function _valueRequired(s?: string | null): null | {required: boolean} {
    const value = s?.trim();
    if (!value) return {
        required: true
    };
    return null
}

function _minLength(minLength: number, s?: string | null): null | {minlength: {requiredLength: number, actualLength: number}} {
    if (isNullOrUndefined(s)) {
        return null;
    }
    const value = s?.trim();
    if (!value || value.length < minLength) {
        return {
            minlength: {requiredLength: minLength, actualLength: value?.length ?? 0}
        }
    }
    return null
}

function _maxLength(maxLength: number, s?: string | null): null | {maxlength: {requiredLength: number, actualLength: number}} {
    if (isNullOrUndefined(s)) {
        return null;
    }
    const value = s?.trim();
    if (!value || value.length > maxLength) {
        return {
            maxlength: {requiredLength: maxLength, actualLength: value?.length ?? 0}
        }
    }
    return null
}

function _emailValidator(s?: string | null): null | {invalidEmail: boolean} {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const value = s?.trim();
    if (!value) return null;
    return emailRegex.test(value) ? null : { invalidEmail: true };
}

function _phoneValidator(s?: string | null): null | { invalidPhone: true } {
    const phoneRegex = /^(\+)?([0-9\s\-().]{6,20})$/;
    const value = s?.trim();
    if (!value) {
        return null;
    }
    // Remove spaces, dashes, dots, parentheses to count digits
    const digitsOnly = value.replace(/[\s\-().]/g, '');
    if (!/^\d+$/.test(digitsOnly)) {
        return { invalidPhone: true };
    }
    if (digitsOnly.length < 6 || digitsOnly.length > 20) {
        return { invalidPhone: true };
    }
    return phoneRegex.test(value) ? null : { invalidPhone: true };
}
