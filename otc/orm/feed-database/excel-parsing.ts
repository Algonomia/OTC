import * as fs from 'fs';
import * as ExcelJS from 'exceljs';

export type STDCell = string | Date | number;

export namespace ExcelParsingUtils {
    export async function getExcelSheet(filePath: string, sheetName = '') {
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
        const worksheet = workbook.getWorksheet(sheetName);

        if (!worksheet) {
            return [];
        }

        const headers = _getHeaders(worksheet);
        return _getRowsData(worksheet, headers);
    }

    function _getHeaders(worksheet: ExcelJS.Worksheet): string[] {
        const headers: string[] = [];
        const firstRow = worksheet.getRow(1);
        firstRow.eachCell((cell, colNumber) => {
            headers[colNumber - 1] = cell.value as string;
        });
        return headers;
    }

    function _getRowsData(worksheet: ExcelJS.Worksheet, headers: string[]): any[] {
        const rows: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            const rowData = _mapRowData(row, headers);
            if (Object.keys(rowData).length > 0) {
                rows.push(rowData);
            }
        });
        return rows;
    }

    function _mapRowData(row: ExcelJS.Row, headers: string[]): any {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
                const value = _normalizeCellValue(cell.value);
                rowData[header] = value === undefined ? null : value;
            }
        });
        return rowData;
    }

    function _normalizeCellValue(value: any): any {
        if (value && typeof value === 'object' && 'result' in value) {
            return (value as any).result;
        } else if (value && typeof value === 'object' && 'richText' in value) {
            return (value as any).richText.map((rt: any) => rt.text).join('');
        }
        return value;
    }

    export function parseExcelCellToEnum<T extends string>(input: STDCell, enumType: Record<string, T>): T | undefined {
        if (!input || input === 'N/A') {
            return undefined;
        } else if (typeof input === 'string') {
            const values = Object.values(enumType);
            if (values.includes(input as T)) {
                return input as T;
            }
        }
        return undefined;
    }

    export function parseExcelCellToString(input: STDCell): undefined | string {
        if (!input || input === 'N/A') {
            return undefined;
        } else if (typeof input === 'string') {
            return input;
        } else if (typeof input === 'number') {
            return '' + input;
        } else if (input instanceof Date) {
            return input.toLocaleDateString();
        } else {
            return String(input);
        }
    }

    export function parseExcelCellToNumber(input: STDCell): undefined | number {
        if (typeof input === 'number') {
            return input;
        }
        if (!input || input === 'N/A') {
            return undefined;
        } else if (typeof input === 'string') {
            try {
                const n = parseFloat(input);
                return isNaN(n) ? undefined : n;
            } catch (e) {
            }
            return undefined;
        } else {
            return (input as Date)?.getTime();
        }
        return undefined;
    }

    export function parseExcelCellToTimestamp(input: STDCell): undefined | number {
        if (!input || input === 'N/A') {
            return undefined;
        } else if (typeof input === 'string') {
            return _toLocaleTimestamp(input);
        } else if (typeof input === 'number') {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's "zero" date is actually 1899-12-30
            return excelEpoch.getTime() + input * 24 * 60 * 60 * 1000;
        } else {
            return input?.getTime();
        }
    }

    export function parseExcelCellToDate(input: STDCell): undefined | Date {
        const timestamp = parseExcelCellToTimestamp(input);
        if (timestamp === undefined) {
            return undefined;
        }
        return new Date(timestamp);
    }

    export function parseExcelCellToStringArr(input: STDCell): undefined | string[] {
        if (!input || input === 'N/A') {
            return undefined;
        } else if (typeof input === 'string') {
            return _getStringArrayFromJsonString(input);
        } else if (typeof input === 'number') {
            return ['' + input];
        } else if (input instanceof Date) {
            return [input.toLocaleDateString()];
        } else {
            return [String(input)];
        }
    }

    function _toLocaleTimestamp(input: string): undefined | number {
        const date = new Date(input)?.getTime();
        if (isNaN(date)) {
            return undefined;
        }
        return date;
    }

    function _getStringArrayFromJsonString(input: string): string[] {
        try {
            let cleaned = input.replace(/\u00A0/g, ' ').trim();
            if (cleaned.startsWith("['") || cleaned.startsWith("['")) {
                cleaned = cleaned.replace(/'/g, '"');
            }

            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                return parsed;
            }
        } catch(e) {
            console.log(input, e)
        }
        return [input];
    }
}
