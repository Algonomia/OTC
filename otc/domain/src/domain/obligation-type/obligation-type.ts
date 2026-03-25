import {AEnhancedEnumFactory, ArrayUtils} from '@algonomia/ts-shared';

export enum EObligationTypeId {
    CbCR = 'CbCR',
    CbCRNotification = 'CbCRNotification',
    PublicCbCR = 'PublicCbCR',
    LocalFile = 'LocalFile',
    MasterFile = 'MasterFile',
    AnnualTPForm = 'AnnualTPForm',
    RelatedPartyDisclosure = 'RelatedPartyDisclosure',
    SimplifiedTPDocumentation = 'SimplifiedTPDocumentation',
    MasterFileNotification = 'MasterFileNotification',
    CIT = 'CIT',

    // sub obligations
    SpecialItemFile = 'SpecialItemFile'
}

export class ObligationType extends AEnhancedEnumFactory {
    static master_file = new ObligationType(EObligationTypeId.MasterFile, 'ObligationDueDateDomain.ObligationType.MasterFile.text', 'ObligationDueDateDomain.ObligationType.MasterFile.info', true, [EObligationTypeId.MasterFileNotification]);
    static local_file = new ObligationType(
        EObligationTypeId.LocalFile, 'ObligationDueDateDomain.ObligationType.LocalFile.text',
        'ObligationDueDateDomain.ObligationType.LocalFile.info', true, [EObligationTypeId.SpecialItemFile]
    );
    static annual_tp_form = new ObligationType(
        EObligationTypeId.AnnualTPForm, 'ObligationDueDateDomain.ObligationType.AnnualTPForm.text',
        'ObligationDueDateDomain.ObligationType.AnnualTPForm.info'
    );
    static cbcr = new ObligationType(EObligationTypeId.CbCR, 'ObligationDueDateDomain.ObligationType.CbCR.text', 'ObligationDueDateDomain.ObligationType.CbCR.info');
    static public_cbcr = new ObligationType(EObligationTypeId.PublicCbCR, 'ObligationDueDateDomain.ObligationType.PublicCbCR.text', 'ObligationDueDateDomain.ObligationType.PublicCbCR.info');
    static cbcr_notification = new ObligationType(EObligationTypeId.CbCRNotification, 'ObligationDueDateDomain.ObligationType.CbCRNotification.text', 'ObligationDueDateDomain.ObligationType.CbCRNotification.info');
    static related_party_disclosure = new ObligationType(EObligationTypeId.RelatedPartyDisclosure, 'ObligationDueDateDomain.ObligationType.RelatedPartyDisclosure.text', 'ObligationDueDateDomain.ObligationType.RelatedPartyDisclosure.info');
    static simplified_tp_documentation = new ObligationType(EObligationTypeId.SimplifiedTPDocumentation, 'ObligationDueDateDomain.ObligationType.SimplifiedTPDocumentation.text', 'ObligationDueDateDomain.ObligationType.SimplifiedTPDocumentation.info');
    static master_file_notification = new ObligationType(EObligationTypeId.MasterFileNotification, 'ObligationDueDateDomain.ObligationType.MasterFileNotification.text', 'ObligationDueDateDomain.ObligationType.MasterFileNotification.info', true, [EObligationTypeId.SpecialItemFile]);
    static cit = new ObligationType(EObligationTypeId.CIT, 'ObligationDueDateDomain.ObligationType.CIT.text', 'ObligationDueDateDomain.ObligationType.CIT.info');

    static special_item_file = new ObligationType(EObligationTypeId.SpecialItemFile, 'ObligationDueDateDomain.ObligationType.SpecialItemFile.text', 'ObligationDueDateDomain.ObligationType.SpecialItemFile.info', false);

    static getText(id: EObligationTypeId): string {
        return (this.getByIdOrId(id) as ObligationType | undefined)?.text ?? id;
    }

    static getInfo(id: EObligationTypeId): string {
        return (this.getByIdOrId(id) as ObligationType | undefined)?.info ?? id;
    }

    static getObTypeOrStringId(x: ObligationType | string): string {
        return (typeof x === 'string') ? x : x.id;
    }

    static getObTypeOrStringText(x: ObligationType | string): string {
        return (typeof x === 'string') ? x : x.text;
    }

    static getAllMainIds() {
        return this.getAllMains().map((x: ObligationType) => x.id);
    }

    static getAllSubObligationIds() {
        return this.getAllSubObligations().map(x => x.id);
    }

    static getAllSubObligations(): ObligationType[] {
        const mainObligations: ObligationType[] = this.getAllMains();
        return ArrayUtils.flattenUniques(mainObligations.map((x: ObligationType) => {
            return x.getAllSubObligations() as ObligationType[];
        }));
    }

    static getAllMains() {
        return (ObligationType.getAllAvailables() as ObligationType[]).filter(
            (x: ObligationType) => x._isMain
        );
    }

    private constructor(
        protected __id: EObligationTypeId,
        readonly text: string = __id,
        readonly info: string = '',
        readonly _isMain = true,
        readonly sub_obligation_ids: ReadonlyArray<EObligationTypeId> = [],
    ) {
        super(__id);
    }

    get id() {
        return this.__id;
    }

    getAllSubObligations(): ObligationType[] {
        return this.sub_obligation_ids.map(
            subId => ObligationType.getById(subId) as ObligationType | undefined
        ).filter(Boolean) as ObligationType[];
    }
}
