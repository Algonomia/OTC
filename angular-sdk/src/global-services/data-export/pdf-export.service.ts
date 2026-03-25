import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content, StyleDictionary } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { AssetLoader, DocumentExportAsset } from './pdf-assets-loader';
import {HttpUtilsService} from '../http-utils.service';
import {TranslateService} from '@ngx-translate/core';

export type PageSize = 'A4' | 'A3' | 'A5' | 'LETTER' | 'LEGAL';
export type PageOrientation = 'portrait' | 'landscape';
export type Margins = [number, number, number, number] | number;

export interface PdfExportOptions {
    headerText?: string;
    footerText?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    showPageNumbers?: boolean;
    pageSize?: PageSize;
    pageOrientation?: PageOrientation;
    margins?: Margins;
    assets?: DocumentExportAsset[];
}

const PDF_LAYOUT = {
    A4_CONTENT_WIDTH: 555,   // 595 (A4 width in pt) - 2 * 20 (margins)
    PAGE_MARGIN: 20,
    HEADER_TOP: 50,
    FOOTER_BOTTOM: 50,
    SEPARATOR_WIDTH: 0.5,
    DEFAULT_FONT_SIZE: 11,
} as const;

export const PDF_THEME = {
    PRIMARY: '--main-3',
    SECONDARY: '--main-4',
    resolve: (varName: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim(),
} as const;

@Injectable({
    providedIn: 'root'
})
export class PdfExportService {
    private static readonly FONT_WEIGHTS = ['light', 'normal', 'semibold', 'bold', 'extrabold'] as const;
    private static readonly FONT_FILES: Record<string, string> = {
        light:     'IntegralUI-Light.woff',
        normal:    'IntegralUI-Regular.woff',
        semibold:  'IntegralUI-Semibold.woff',
        bold:      'IntegralUI-Bold.woff',
        extrabold: 'IntegralUI-Extrabold.woff',
    };
    private static readonly FONT_DIR = 'assets/fonts';

    private _fontsLoaded = false;

    constructor(private _http: HttpClient, private _assetsLoader: AssetLoader, private _translate: TranslateService) {}

    /**
     * Opens the PDF in a new window/tab
     */
    async open(
        content: Content | Content[],
        options: PdfExportOptions = {}
    ): Promise<void> {
        try {
            await this._addCustomFontsToVfs();
            const documentDefinition = await this._createDocumentDefinition(content, options);
            const fonts = {algo: PdfExportService.FONT_FILES};
            pdfMake.createPdf(documentDefinition, undefined, fonts, pdfMake.vfs).open();
        } catch (error) {
            console.error(this._translate.instant('AngularSdk.GenericPdfExport.Errors.GenerationFailed'), error);
            throw error;
        }
    }

    async export(
        content: Content | Content[],
        options: PdfExportOptions = {},
        filename?: string
    ): Promise<void> {
        try {
            await this._addCustomFontsToVfs();
            const documentDefinition = await this._createDocumentDefinition(content, options);
            const generatedFilename = filename || this._generateFilename();
            const fonts = {algo: PdfExportService.FONT_FILES};
            const pdf = pdfMake.createPdf(documentDefinition, undefined, fonts, pdfMake.vfs);
            pdf.download(generatedFilename);
        } catch (error) {
            console.error(this._translate.instant('AngularSdk.GenericPdfExport.Errors.ExportFailed'), error);
            throw error;
        }
    }

    /** Fetch fonts from assets, then load them into pdfmake's vfs */
    private async _addCustomFontsToVfs(): Promise<void> {
        if (this._fontsLoaded) return;
        const pdfMakeRef = pdfMake as any; // intermediate ref to bypass esbuild immutable import check
        pdfMakeRef.vfs = pdfFonts;

        await Promise.all(
            PdfExportService.FONT_WEIGHTS.map(async weight => {
                const file = PdfExportService.FONT_FILES[weight];
                const path = `${PdfExportService.FONT_DIR}/${file}`;
                const blob = await HttpUtilsService.getFile(this._http, path);
                const dataUrl = await HttpUtilsService.blobToBase64(blob);
                const raw = dataUrl.split('base64,')[1];
                if (!raw) throw new Error(this._translate.instant('AngularSdk.GenericPdfExport.Errors.FailedToDecodeFile', { file }));
                pdfMake.vfs[file] = raw;
            })
        );
        this._fontsLoaded = true;
    }

    private async _createDocumentDefinition(
        content: Content | Content[],
        options: PdfExportOptions = {}
    ): Promise<TDocumentDefinitions> {
        const finalOptions = {...this._defaultOptions, ...options};
        const mainColor = PDF_THEME.resolve(PDF_THEME.PRIMARY);
        const main4Color = PDF_THEME.resolve(PDF_THEME.SECONDARY);
        const currentDate = new Date().toLocaleDateString();

        const loadedAssets = await this._loadAssets(finalOptions.assets);

        return {
            info: {
                author: finalOptions.author,
                subject: finalOptions.subject,
                keywords: finalOptions.keywords,
                creator: this._translate.instant('AngularSdk.GenericPdfExport.Creator'),
                producer: 'pdfmake'
            },
            pageSize: finalOptions.pageSize,
            pageOrientation: finalOptions.pageOrientation,
            pageMargins: finalOptions.margins,

            header: this._createHeader(currentDate, mainColor, loadedAssets),
            footer: this._createFooter(finalOptions, mainColor),
            content: this._createContent(content),
            styles: this._createStyles(mainColor, main4Color),
            defaultStyle: {
                font: 'algo',
                fontSize: PDF_LAYOUT.DEFAULT_FONT_SIZE,
                color: mainColor
            }
        };
    }

    /**
     * Gets default options merged with user options
     */
    private get _defaultOptions(): Required<PdfExportOptions> {
        return {
            headerText: this._translate.instant('AngularSdk.GenericPdfExport.HeaderText'),
            footerText: this._translate.instant('AngularSdk.GenericPdfExport.FooterText', {year: new Date().getFullYear()}),
            author: '',
            subject: this._translate.instant('AngularSdk.GenericPdfExport.Subject'),
            keywords: '',
            showPageNumbers: true,
            pageSize: 'A4',
            pageOrientation: 'portrait',
            margins: [PDF_LAYOUT.PAGE_MARGIN, PDF_LAYOUT.HEADER_TOP, PDF_LAYOUT.PAGE_MARGIN, PDF_LAYOUT.FOOTER_BOTTOM],
            assets: []
        };
    }
    /**
     * Creates the header function for the PDF
     */
    private _createHeader(
        currentDate: string,
        mainColor: string,
        loadedAssets: { [key: string]: string }
    ) {
        return (currentPage: number, pageCount: number) => {
            const logo = loadedAssets['logo'];
            const wordmark = loadedAssets['wordmark'];

            const headerColumns: Content[] = [];
            if (logo) {
                headerColumns.push({
                    image: logo, width: 22, height: 22,
                    margin: [15, 12, 5, 0], alignment: 'left'
                });
            }
            if (wordmark) {
                headerColumns.push({
                    image: wordmark, width: 27, height: 13,
                    margin: [12, 18, 0, 0], alignment: 'left'
                });
            }
            headerColumns.push({
                text: currentDate, style: 'headerDate',
                alignment: 'right', margin: [0, 18, 20, 0]
            });

            return {
                stack: [
                    {columns: headerColumns},
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: PDF_LAYOUT.PAGE_MARGIN,
                                y1: 0,
                                x2: PDF_LAYOUT.A4_CONTENT_WIDTH + PDF_LAYOUT.PAGE_MARGIN,
                                y2: 0,
                                lineWidth: PDF_LAYOUT.SEPARATOR_WIDTH,
                                lineColor: mainColor
                            }
                        ],
                        margin: [0, 5, 0, 5]
                    },
                ]} as Content;
        };
    }

    /**
     * Creates the footer function for the PDF
     */
    private _createFooter(options: Required<PdfExportOptions>, mainColor: string) {
        return (currentPage: number, pageCount: number) => {
            const footerContent: Content[] = [
                {
                    text: options.footerText,
                    style: 'footer',
                    alignment: 'left',
                    margin: [PDF_LAYOUT.PAGE_MARGIN, 15, 0, 20]
                }
            ];

            if (options.showPageNumbers) {
                footerContent.push({
                    text: `Page ${currentPage}`,
                    style: 'pageNumber',
                    alignment: 'right',
                    margin: [0, 15, PDF_LAYOUT.PAGE_MARGIN, 20]
                });
            }

            return {
                stack: [
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: PDF_LAYOUT.PAGE_MARGIN,
                                y1: 0,
                                x2: PDF_LAYOUT.A4_CONTENT_WIDTH + PDF_LAYOUT.PAGE_MARGIN,
                                y2: 0,
                                lineWidth: PDF_LAYOUT.SEPARATOR_WIDTH,
                                lineColor: mainColor
                            }
                        ],
                        margin: [0, 10, 0, 5]
                    },
                    {
                        columns: footerContent
                    }
                ]
            } as Content;
        };
    }

    /**
     * Creates the content structure with header separator line
     */
    private _createContent(content: Content | Content[]): Content[] {
        return Array.isArray(content) ? content : [content];
    }

    /**
     * Creates the styles object for the PDF
     */
    private _createStyles(mainColor: string, main4Color: string): StyleDictionary {
        return {
            header: {
                fontSize: 12,
                color: mainColor
            },
            headerDate: {
                fontSize: 8,
                color: mainColor
            },
            footer: {
                fontSize: 8,
                color: mainColor,
            },
            pageNumber: {
                fontSize: 9,
                color: mainColor
            },
            title: {
                fontSize: 20,

                color: mainColor,
                decoration: 'underline'
            },
            heading: {
                fontSize: 14,
                color: main4Color,
                margin: [0, 15, 0, 5]
            },
            subheading: {
                fontSize: 12,
                color: main4Color,
                margin: [0, 0, 0, 0]
            },
            tableCell: {
                fontSize: 8,
                color: main4Color,
                alignment: 'left',
                margin: [0, 2, 0, 2]
            }
        };
    }

    private _generateFilename(): string {
        const date = new Date().toISOString().split('T')[0];
        return this._translate.instant('AngularSdk.GenericPdfExport.DocumentName', {date});
    }

    private async _loadAssets(assets: DocumentExportAsset[]): Promise<{ [key: string]: string }> {
        const loadedAssets: { [key: string]: string } = {};

        if (!assets || assets.length === 0) {
            return loadedAssets;
        }

        await this._assetsLoader.populateAssetsObj(assets);

        for (const asset of assets) {
            try {
                if (asset.category === 'images') {
                    loadedAssets[asset.name] = this._assetsLoader.getImageAssetValue(asset.name);
                } else if (asset.category === 'misc') {
                    loadedAssets[asset.name] = this._assetsLoader.getMiscAsset(asset.name) as string;
                }
            } catch (error) {
                console.warn(this._translate.instant('AngularSdk.GenericPdfExport.Errors.FailedToLoadAsset', { asset: asset.name }), error);
            }
        }

        return loadedAssets;
    }
}
