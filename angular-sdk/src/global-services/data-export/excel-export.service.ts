import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelExportOptions {
    worksheetName?: string;
    fileName?: string;
    boldHeaders?: boolean;
    columnAlignment?: {
        vertical?: 'top' | 'middle' | 'bottom';
        horizontal?: 'left' | 'center' | 'right';
        wrapText?: boolean;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ExcelExportService {
    private readonly _DEFAULT_WORKSHEET_NAME = 'Data';
    private readonly _DEFAULT_FILE_NAME = 'export.xlsx';
    private readonly _DEFAULT_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    private readonly _DEFAULT_MAX_CELL_LENGTH = 100;
    private readonly _DEFAULT_CELL_LENGTH_PADDING = 2;
    private readonly _HEADER_SIZE = 10;

    constructor() {}

    exportToExcel(
        data: Record<string, any>[],
        headers: string[],
        options?: ExcelExportOptions
    ): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(options?.worksheetName ?? this._DEFAULT_WORKSHEET_NAME);
        this._addBoldHeaders(worksheet, headers, options?.boldHeaders);
        const formattedData = this._computeFormattedData(data, headers);
        this._addRowsToWorksheets(worksheet, formattedData);
        this._addColumnAlignment(worksheet, options?.columnAlignment);
        this._adjustColumnsLength(worksheet, headers, formattedData);
        return this._downloadBlob(workbook, options?.fileName);
    }

    private _addBoldHeaders(worksheet: ExcelJS.Worksheet, headers: string[], boldHeaders: ExcelExportOptions['boldHeaders']) {
        worksheet.addRow(headers);

        if (boldHeaders !== false) {
            worksheet.getRow(1).font = { bold: true, size: this._HEADER_SIZE };
        }
    }

    private _addColumnAlignment(worksheet: ExcelJS.Worksheet, columnAlignment: ExcelExportOptions['columnAlignment']) {
        if (!columnAlignment) {
            return;
        }
        worksheet.columns.forEach(col => {
            col.alignment = {
                vertical: columnAlignment?.vertical ?? 'middle',
                horizontal: columnAlignment?.horizontal ?? 'left',
                wrapText: columnAlignment?.wrapText ?? true
            };
        });
    }

    private _computeFormattedData(data: Record<string, any>[], headers: string[]): any[][] {
        return data.map(row => headers.map(h => this._sanitizeValue(row[h])));
    }

    private _addRowsToWorksheets(worksheet: ExcelJS.Worksheet, data: any[][]){
        for (const row of data) {
            worksheet.addRow(row);
        }
    }

    private _sanitizeValue(value: any): any {
        if (Array.isArray(value)) {
            const subValues = value.map(x => this._sanitizeValue(x)).filter(x => x !== '');
            return subValues.join(', ');
        }
        if (value === null || value === undefined) {
            return '';
        }
        if (value instanceof Date) {
            return value;
        }
        const type = typeof value;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return value;
        }
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    private _adjustColumnsLength(worksheet: ExcelJS.Worksheet, headers: string[], data: any[][]) {
        worksheet.columns.forEach((column, i) => {
            const valuesLength = data.map(d => d?.[i]?.toString()?.length ?? 0);
            const maxValuesLength = Math.max(...valuesLength, headers?.[i]?.length, 0);
            const maxLength = Math.min(this._DEFAULT_MAX_CELL_LENGTH, maxValuesLength);
            column.width = maxLength + this._DEFAULT_CELL_LENGTH_PADDING;
        });
    }

    private async _downloadBlob(workbook: ExcelJS.Workbook, fileName: string = this._DEFAULT_FILE_NAME) {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: this._DEFAULT_MIME_TYPE });
        saveAs(blob, fileName);
    }
}
