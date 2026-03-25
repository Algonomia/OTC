import {Injectable} from '@angular/core';
import {Content} from 'pdfmake/interfaces';
import {TranslateService} from '@ngx-translate/core';
import {
    AlgoTableColumns,
    AssetLoader,
    CountriesService,
    DataWrapper,
    DocumentExportAsset,
    DocumentExportAssetType,
    PdfExportOptions,
    PdfExportService,
    PDF_THEME
} from '@algonomia/angular-sdk';

interface JurisdictionInfo {
    iso2: string;
    name: string;
}

@Injectable({
  providedIn: 'root'
})
export class JurisdictionExportService {

    private _flagCache = new Map<string, string | null>();

    constructor(
        private _pdfExportService: PdfExportService,
        private _translateService: TranslateService,
        private _assetLoader: AssetLoader
    ) { }

    async exportJurisdictionData<T>(
        columns: AlgoTableColumns<T>[],
        dataWrapper: DataWrapper<T>,
        wrapperDiv: HTMLDivElement,
        getIso2Callback?: (x: T) => string,
        exportType: 'download' | 'open' = 'download',
    ): Promise<Blob | void> {
        const data = dataWrapper.line as T;
        const iso2 = (getIso2Callback ? getIso2Callback(data) : '').trim();
        const jurisdiction: JurisdictionInfo = { iso2, name: CountriesService.getName(iso2, this._translateService.currentLang) };

        const content = await this.createJurisdictionContent(columns, dataWrapper, wrapperDiv, jurisdiction);
        const options = this.createExportOptions(jurisdiction);
        const filename = this.generateFilename(jurisdiction);

        switch (exportType) {
            case 'download':
                await this._pdfExportService.export(content, options, filename);
                break;
            case 'open':
                await this._pdfExportService.open(content, options);
                break;
        }
    }

    /**
     * Creates the PDF content structure for jurisdiction data using dynamic columns
     */
    private async createJurisdictionContent<T>(
        columns: AlgoTableColumns<T>[],
        dataWrapper: DataWrapper<T>,
        wrapperDiv: HTMLDivElement,
        jurisdiction: JurisdictionInfo
    ): Promise<Content[]> {
        const data = dataWrapper.line as T;
        const flagBase64 = await this.captureCountryFlag(wrapperDiv, jurisdiction.iso2);
        const content: Content[] = [
            {
                columns: [
                    {
                        width: 'auto',
                        text: jurisdiction.name,
                        style: 'heading',
                        margin: [0, 0, 3, 0]
                    },
                    {
                        width: 'auto',
                        columns: flagBase64 ? [
                            {
                                image: flagBase64,
                                width: 13,
                                height: 10,
                                margin: [3, 4, 5, 0]
                            },
                            {
                                text: `(${jurisdiction.iso2})`,
                                style: 'subheading',
                                width: '100',
                                margin: [9, 2, 0, 0]
                            }
                        ] : [
                            {
                                text: `(${jurisdiction.iso2})`,
                                style: 'subheading',
                                width: '100%',
                                margin: [3, 0, 0, 0]
                            }
                        ]
                    }
                ],
                margin: [0, 0, 0, 15]
            }
        ];

        const tableBody: Content[][] = [];

        columns.forEach(column => {
            if (column.show && !column.show([data])) {
                return;
            }
            let displayValue: string;

            if (column.pdfRenderFunction) {
                const pdfResult = column.pdfRenderFunction(data);
                displayValue = Array.isArray(pdfResult) ? pdfResult.join(', ') : pdfResult;
            } else {
                // Use the processed value from dataWrapper (same as card component)
                displayValue = dataWrapper.valueLine[column.id];
            }

            if (!displayValue || displayValue === 'undefined' || displayValue === 'null') {
                displayValue = 'N/A';
            }

            tableBody.push([
                {text: this._translateService.instant(column.title || column.id), style: 'tableCell'},
                {text: displayValue, style: 'tableCell'}
            ]);
        });

        const mainColor = PDF_THEME.resolve(PDF_THEME.PRIMARY);

        content.push({
            table: {
                headerRows: 0,
                widths: ['50%', '50%'],
                body: tableBody
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => mainColor,
                vLineColor: () => mainColor,
                fillColor: () => null
            },
            margin: [0, 0, 0, 20]
        });

        return content;
    }

    /**
     * Creates export options for jurisdiction PDF
     */
    private createExportOptions(jurisdiction: JurisdictionInfo): PdfExportOptions {
        return {
            headerText: this._translateService.instant('OTCFront.JurisdictionPdfExport.DocumentName', {jurisdiction: jurisdiction.name}),
            footerText: this._translateService.instant('OTCFront.JurisdictionPdfExport.FooterText', {year: new Date().getFullYear()}),
            subject: this._translateService.instant('OTCFront.JurisdictionPdfExport.Subject', {jurisdiction: jurisdiction.name}),
            keywords: `jurisdiction, ${jurisdiction.name}, ${jurisdiction.iso2}, obligations, due dates`,
            author: 'Obligation Due Dates System',
            pageSize: 'A4',
            pageOrientation: 'portrait',
            showPageNumbers: true,
            assets: this.createDefaultAssets()
        };
    }

    /**
     * Creates default assets for PDF export (logo and wordmark)
     */
    private createDefaultAssets(): DocumentExportAsset[] {
        return [
            {
                name: 'logo',
                url: 'assets/logo/Logo/Logo Medium.svg',
                type: DocumentExportAssetType.SVG,
                category: 'images'
            },
            {
                name: 'wordmark',
                url: 'assets/logo/Short wordmark/Short wordmark Medium.svg',
                type: DocumentExportAssetType.SVG,
                category: 'images'
            }
        ];
    }

    private generateFilename(jurisdiction: JurisdictionInfo): string {
        const name = jurisdiction.name?.replace(/\s+/g, '_') || 'Jurisdiction';
        const date = new Date().toISOString().split('T')[0];
        return this._translateService.instant('OTCFront.JurisdictionPdfExport.DocumentName', { jurisdiction: name, date });
    }

    /**
     * Resolves the flag SVG URL for a given ISO2 code.
     * Reads the resolved background-image from a .fi-{iso2} element to get the build-relative path.
     */
    private resolveFlagUrl(wrapperDiv: HTMLDivElement, iso2: string): string | null {
        const flagSpan = wrapperDiv.querySelector(`span.fi.fi-${iso2.toLowerCase()}`) as HTMLElement;
        if (!flagSpan) return null;

        const bgImage = window.getComputedStyle(flagSpan).backgroundImage;
        const match = bgImage?.match(/url\(["']?([^"')]+)["']?\)/);
        if (!match?.[1]) return null;

        const raw = match[1];
        if (raw.startsWith('http')) return raw;
        if (raw.startsWith('/')) return window.location.origin + raw;
        const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + raw;
    }

    /**
     * Captures the country flag as base64 PNG for PDF embedding.
     */
    private async captureCountryFlag(wrapperDiv: HTMLDivElement, iso2: string): Promise<string | null> {
        if (this._flagCache.has(iso2)) return this._flagCache.get(iso2)!;

        try {
            const imageUrl = this.resolveFlagUrl(wrapperDiv, iso2);
            if (!imageUrl) {
                this._flagCache.set(iso2, null);
                return null;
            }

            const assetKey = `flag_${iso2}`;
            await this._assetLoader.populateSingleAssetToObj({
                name: assetKey,
                url: imageUrl,
                type: DocumentExportAssetType.SVG,
                category: 'images',
                alwaysFetch: false,
            });

            const result = this._assetLoader.getImageAssetValue(assetKey) || null;
            this._flagCache.set(iso2, result);
            return result;
        } catch {
            this._flagCache.set(iso2, null);
            return null;
        }
    }
}
