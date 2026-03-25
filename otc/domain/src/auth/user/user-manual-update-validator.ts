import {AlgoStringValidator, ValidatorGroup} from '@algonomia/ts-shared';
import {IUserManualUpdate} from './user.interface';

const _jobValidatorMeta = {
    minLength: 3,
    label: 'ObligationDueDateDomain.EditUser.job'
}

const _companyValidatorMeta = {
    minLength: 3,
    label: 'ObligationDueDateDomain.EditUser.company'
}

const _proEmailValidatorMeta = {
    label: 'ObligationDueDateDomain.EditUser.pro_email',
    isEmail: true
}

const _phoneValidatorMeta = {
    label: 'ObligationDueDateDomain.EditUser.phone',
    isPhone: true
}

export const userUpdatePartialValidatorGroup = new ValidatorGroup<IUserManualUpdate>({
    job: new AlgoStringValidator({..._jobValidatorMeta, required: false}),
    company: new AlgoStringValidator({..._companyValidatorMeta, required: false}),
    pro_email: new AlgoStringValidator({..._proEmailValidatorMeta, required: false}),
    phone: new AlgoStringValidator({..._phoneValidatorMeta, required: false}),
})

export const userUpdateFullValidatorGroup = new ValidatorGroup<IUserManualUpdate>({
    job: new AlgoStringValidator({..._jobValidatorMeta, required: true}),
    company: new AlgoStringValidator({..._companyValidatorMeta, required: true}),
    pro_email: new AlgoStringValidator({..._proEmailValidatorMeta, required: true}),
    phone: new AlgoStringValidator({..._phoneValidatorMeta, required: true}),
})
