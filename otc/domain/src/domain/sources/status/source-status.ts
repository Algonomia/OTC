import {AEnhancedEnumFactory} from '@algonomia/ts-shared';

export enum ESourceStatus {
    WaitForUrlSafeBrowsingCheck = 'WaitForUrlSafeBrowsingCheck',
    WaitForUrlMalwareScan = 'WaitForUrlMalwareScan',
    RejectedUrl = 'RejectedUrl',
    WaitForValidation = 'WaitForValidation',
    RejectedByAdmin = 'RejectedByAdmin',
    WaitForScrapping = 'WaitForScrapping',
    UrlNotFound = 'UrlNotFound',
    ScanForMalware = 'ScanForMalware',
    RejectedByMalwareScan = 'RejectedByMalwareScan',
    WaitForOCR = 'WaitForOCR',
    WaitForAI = 'WaitForAI',
    FullyProcessed = 'FullyProcessed'
}

export class SourceStatusExt extends AEnhancedEnumFactory {
    static wait_for_url_safe_browsing_check = new SourceStatusExt(
        ESourceStatus.WaitForUrlSafeBrowsingCheck,
        'ObligationDueDateDomain.SourceStatus.WaitForUrlSafeBrowsingCheck.text',
        'main-3-outline',
        'assets/images/status/waiting for url check@1x.svg'
    );
    static wait_for_url_malware_scan = new SourceStatusExt(
        ESourceStatus.WaitForUrlMalwareScan,
        'ObligationDueDateDomain.SourceStatus.WaitForUrlMalwareScan.text',
        'main-3-outline',
        'assets/images/status/waiting for malware scan@1x.svg'
    );
    static rejected_url = new SourceStatusExt(
        ESourceStatus.RejectedUrl,
        'ObligationDueDateDomain.SourceStatus.RejectedUrl.text',
        'ko-3-outline',
        'assets/images/status/rejected@1x.svg'
    );
    static wait_for_validation = new SourceStatusExt(
        ESourceStatus.WaitForValidation,
        'ObligationDueDateDomain.SourceStatus.WaitForValidation.text',
        'main-3-outline',
        'assets/images/status/waiting for validation@1x.svg'
    );
    static rejected_by_admin = new SourceStatusExt(
        ESourceStatus.RejectedByAdmin,
        'ObligationDueDateDomain.SourceStatus.RejectedByAdmin.text',
        'ko-3-outline',
        'assets/images/status/rejected@1x.svg'
    );
    static wait_for_scrapping = new SourceStatusExt(
        ESourceStatus.WaitForScrapping,
        'ObligationDueDateDomain.SourceStatus.WaitForScrapping.text',
        'main-3-outline',
        'assets/images/status/waiting for scrapping@1x.svg'
    );
    static url_not_found = new SourceStatusExt(
        ESourceStatus.UrlNotFound,
        'ObligationDueDateDomain.SourceStatus.UrlNotFound.text',
        'ko-3-outline',
        'assets/images/status/rejected@1x.svg'
    );
    static scan_for_malware = new SourceStatusExt(
        ESourceStatus.ScanForMalware,
        'ObligationDueDateDomain.SourceStatus.ScanForMalware.text',
        'orange-3-outline',
        'assets/images/status/scanning for malware@1x.svg'
    );
    static rejected_by_malware_scan = new SourceStatusExt(
        ESourceStatus.RejectedByMalwareScan,
        'ObligationDueDateDomain.SourceStatus.RejectedByMalwareScan.text',
        'ko-3-outline',
        'assets/images/status/rejected@1x.svg'
    );
    static wait_for_ocr = new SourceStatusExt(
        ESourceStatus.WaitForOCR,
        'ObligationDueDateDomain.SourceStatus.WaitForOCR.text',
        'main-3-outline',
        'assets/images/status/waiting for OCR@1x.svg'
    );
    static wait_for_ai = new SourceStatusExt(
        ESourceStatus.WaitForAI,
        'ObligationDueDateDomain.SourceStatus.WaitForAI.text',
        'main-3-outline',
        'assets/images/status/waiting for AI@1x.svg'
    );
    static fully_processed = new SourceStatusExt(
        ESourceStatus.FullyProcessed,
        'ObligationDueDateDomain.SourceStatus.FullyProcessed.text',
        'ok-3-outline',
        'assets/images/status/validated@1x.svg'
    );

    static getText(id: ESourceStatus): string {
        return (this.getByIdOrId(id) as SourceStatusExt | undefined)?.text ?? id;
    }

    static getStatusFromId(id: ESourceStatus) {
        return SourceStatusExt.getById(id) as SourceStatusExt | undefined;
    }

    private constructor(
        protected __id: ESourceStatus,
        public readonly text: string = __id,
        public readonly color_theme: TSourceColorTheme,
        public readonly icon: string
    ) {
        super(__id);
    }

    get id() {
        return this.__id;
    }
}

export type TSourceColorTheme = 'orange-3-outline' | 'main-3-outline' | 'ok-3-outline' | 'ko-3-outline';
