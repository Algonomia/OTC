import {AEnhancedEnumFactory} from '../ts-templates/enhanced-enum-factory.abstract';

export enum EValidatorErrors {
    required = 'required',
    minlength = 'minlength',
    maxlength = 'maxlength',
    min = 'min',
    max = 'max',
    wrongUrl = 'wrongUrl',
    invalidEmail = 'invalidEmail',
    invalidPhone = 'invalidPhone',
    invalidFormat = 'invalidFormat',
    invalidSubDate = 'invalidSubDate',
    invalidPeriod = 'invalidPeriod',
    notInList = 'notInList',
    forbiddenExtension = 'forbiddenExtension',
    maxSizeExceeded = 'maxSizeExceeded',
    minDateExceeded = 'minDateExceeded',
    maxDateExceeded = 'maxDateExceeded',
    notRespectedBound = 'notRespectedBound',
    invalidObject = 'invalidObject',
    unknownOperator = 'unknownOperator',
    missingArgs = 'missingArgs',
    overflowingArgs = 'overflowingArgs',
    wrongInputs = 'wrongInputs',
    unexpectedOutput = 'unexpectedOutput',
    invalidNestedInputs = 'invalidNestedInputs',
    invalidValues = 'invalidValues',
    missingKeys = 'missingKeys',
    unauthorizedKeys = 'unauthorizedKeys'
}

export class ValidatorErrors extends AEnhancedEnumFactory {
    static readonly required = new ValidatorErrors(EValidatorErrors.required, 'Shared.ValidatorErrors.required');
    static readonly minlength = new ValidatorErrors(EValidatorErrors.minlength, 'Shared.ValidatorErrors.minlength');
    static readonly maxlength = new ValidatorErrors(EValidatorErrors.maxlength, 'Shared.ValidatorErrors.maxlength');
    static readonly min = new ValidatorErrors(EValidatorErrors.min, 'Shared.ValidatorErrors.min');
    static readonly max = new ValidatorErrors(EValidatorErrors.max, 'Shared.ValidatorErrors.max');
    static readonly wrongUrl = new ValidatorErrors(EValidatorErrors.wrongUrl, 'Shared.ValidatorErrors.wrongUrl');
    static readonly invalidEmail = new ValidatorErrors(EValidatorErrors.invalidEmail, 'Shared.ValidatorErrors.invalidEmail');
    static readonly invalidPhone = new ValidatorErrors(EValidatorErrors.invalidPhone, 'Shared.ValidatorErrors.invalidPhone');
    static readonly invalidFormat = new ValidatorErrors(EValidatorErrors.invalidFormat, 'Shared.ValidatorErrors.invalidFormat');
    static readonly invalidSubDate = new ValidatorErrors(EValidatorErrors.invalidSubDate, 'Shared.ValidatorErrors.invalidSubDate');
    static readonly invalidPeriod = new ValidatorErrors(EValidatorErrors.invalidPeriod, 'Shared.ValidatorErrors.invalidPeriod');
    static readonly notInList = new ValidatorErrors(EValidatorErrors.notInList, 'Shared.ValidatorErrors.notInList');
    static readonly forbiddenExtension = new ValidatorErrors(EValidatorErrors.forbiddenExtension, 'Shared.ValidatorErrors.forbiddenExtension');
    static readonly maxSizeExceeded = new ValidatorErrors(EValidatorErrors.maxSizeExceeded, 'Shared.ValidatorErrors.maxSizeExceeded');
    static readonly minDateExceeded = new ValidatorErrors(EValidatorErrors.minDateExceeded, 'Shared.ValidatorErrors.minDateExceeded');
    static readonly maxDateExceeded = new ValidatorErrors(EValidatorErrors.maxDateExceeded, 'Shared.ValidatorErrors.maxDateExceeded');
    static readonly invalidObject = new ValidatorErrors(EValidatorErrors.invalidObject, 'Shared.ValidatorErrors.invalidObject');
    static readonly notRespectedBound = new ValidatorErrors(EValidatorErrors.notRespectedBound, 'Shared.ValidatorErrors.notRespectedBound');
    static readonly invalidValues = new ValidatorErrors(EValidatorErrors.invalidValues, 'Shared.ValidatorErrors.invalidValues');
    static readonly missingKeys = new ValidatorErrors(EValidatorErrors.missingKeys, 'Shared.ValidatorErrors.missingKeys');
    static readonly unauthorizedKeys = new ValidatorErrors(EValidatorErrors.unauthorizedKeys, 'Shared.ValidatorErrors.unauthorizedKeys');
    static readonly unknownOperator = new ValidatorErrors(EValidatorErrors.unknownOperator, 'Shared.ValidatorErrors.unknownOperator');
    static readonly missingArgs = new ValidatorErrors(EValidatorErrors.missingArgs, 'Shared.ValidatorErrors.missingArgs');
    static readonly overflowingArgs = new ValidatorErrors(EValidatorErrors.overflowingArgs, 'Shared.ValidatorErrors.overflowingArgs');
    static readonly wrongInputs = new ValidatorErrors(EValidatorErrors.wrongInputs, 'Shared.ValidatorErrors.wrongInputs');
    static readonly unexpectedOutput = new ValidatorErrors(EValidatorErrors.unexpectedOutput, 'Shared.ValidatorErrors.unexpectedOutput');
    static readonly invalidNestedInputs = new ValidatorErrors(EValidatorErrors.invalidNestedInputs, 'Shared.ValidatorErrors.invalidNestedInputs');

    static getErrorFromId(id: ValidatorErrors) {
        return (this.getById(id) as ValidatorErrors | undefined)?.text ?? 'Shared.ValidatorErrors.default';
    }

    private constructor(_id: EValidatorErrors, readonly text: string) {
        super(_id);
    }
}
