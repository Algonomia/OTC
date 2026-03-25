import {CountriesUtils} from '@algonomia/ts-shared';
import {ObligationType, EObligationTypeId} from '../../obligation-type/obligation-type';
import {Indicator, EIndicatorId} from '../../indicators/interfaces/interfaces';

export function getJurisdictionMeta(values?: string[]) {
    return {
        label: 'ObligationDueDateDomain.ValuesValidators.ChooseJurisdiction.label',
        placeholder: 'ObligationDueDateDomain.ValuesValidators.ChooseJurisdiction.placeholder',   required: true,
        list: CountriesUtils.iso2List.filter(x => !values ? true : values?.includes(x)),
        isCountryIso: true,
        translate: true
    };
}

export function getObligationTypeIdMeta(values?: EObligationTypeId[]) {
    return {
        required: true,
        list: ObligationType.getAllMainIds().filter(x => !values ? true : values?.includes(x)),
        translate: true,
        textCallback: ((x: EObligationTypeId) => ObligationType.getText(x)),
        label: 'ObligationDueDateDomain.ValuesValidators.ChooseObligation.label',
        placeholder: 'ObligationDueDateDomain.ValuesValidators.ChooseObligation.placeholder'
    }
};

export function getIndicatorMeta(values?: EIndicatorId[]) {
    return {
        label: 'ObligationDueDateDomain.ValuesValidators.ChooseIndicators.label',
        placeholder: 'ObligationDueDateDomain.ValuesValidators.ChooseIndicators.placeholder',
        required: true,
        list: Indicator.getAllAvailables().map(x => x.id as EIndicatorId).filter(x => !values ? true : values?.includes(x)),
        textCallback: (x: EIndicatorId) => Indicator.getText(x),
        translate: true
    };
};
