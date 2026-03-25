import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum EValuesStatus {
    WaitingForAdminValidation = 'WaitingForAdminValidation',
    Accepted = 'Accepted',
    Rejected = 'Rejected'
}

export class ValuesStatusExt extends AEnhancedEnumFactory {
    static readonly waitingForAdminValidation = new ValuesStatusExt(
        EValuesStatus.WaitingForAdminValidation,
        'ObligationDueDateDomain.ValuesStatus.WaitingForAdminValidation',
        'main-3-outline',
        'assets/images/status/waiting for validation@1x.svg'
    );
    static readonly accepted = new ValuesStatusExt(
        EValuesStatus.Accepted,
        'ObligationDueDateDomain.ValuesStatus.AcceptedByAdmin',
        'ok-3-outline',
        'assets/images/status/validated@1x.svg'
    );
    static readonly rejected = new ValuesStatusExt(
        EValuesStatus.Rejected,
        'ObligationDueDateDomain.ValuesStatus.RejectedByAdmin',
        'ko-3-outline',
        'assets/images/status/rejected@1x.svg'
    );

    static getTextFromId(id: EValuesStatus) {
        return (ValuesStatusExt.getById(id) as ValuesStatusExt)?.text ?? id;
    }

    static getStatusFromId(id: EValuesStatus) {
        return ValuesStatusExt.getById(id) as ValuesStatusExt | undefined;
    }

    private constructor(
        protected __id: EValuesStatus,
        readonly text: string,
        public readonly color_theme: TContributionColorTheme,
        public readonly icon: string
    ) {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}

export type TContributionColorTheme = 'main-3-outline' | 'ok-3-outline' | 'ko-3-outline';
