import {NullUndefinedUtils} from './null-undefined';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

export namespace DateUtils {
    export function getNowSecs(): number | undefined {
        return convertDateToSecTimestamp(new Date());
    }

    export function getUTCTomorrow(): Date {
        const now = new Date();
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    }

    export function getUTCTomorrowSecTimestamp(): number | undefined {
        return convertDateToSecTimestamp(getUTCTomorrow());
    }

    export function convertMsTimestampToSecTimestamp(msTimestamp?: number): number | undefined {
        if (msTimestamp === undefined || msTimestamp === null) {
            return undefined;
        }
        return Math.floor(msTimestamp / 1000);
    }

    export function convertDateToSecTimestamp(date?: Date | null): number | undefined {
        if (date !== undefined && date !== null) {
            return convertMsTimestampToSecTimestamp(date.getTime());
        }
        return undefined;
    }

    export function convertSecTimestampToMsTimestamp(secTimestamp?: number): number | undefined {
        if (secTimestamp !== undefined) {
            return secTimestamp * 1000;
        }
        return undefined;
    }

    export function convertSecTimestampToDate(secTimestamp?: number | null, defaultValue?: Date): Date | undefined {
        if (secTimestamp !== undefined && secTimestamp !== null) {
            return new Date(secTimestamp * 1000);
        }
        return defaultValue;
    }

    export function convertMsTimestampToDate(msTimestamp?: number, defaultValue?: Date): Date | undefined {
        if (msTimestamp !== undefined) {
            return new Date(msTimestamp);
        }
        return defaultValue;
    }

    export function convertSecTimestampUTCYear(secTimestamp?: number): number | undefined {
        if (secTimestamp !== undefined) {
            return convertSecTimestampToDate(secTimestamp)?.getUTCFullYear();
        }
        return undefined;
    }

    export function excelDateToJSDate(serial: number): Date {
        return new Date((Math.floor(serial - 25569) * 86400 + new Date().getTimezoneOffset() * 60) * 1000);
    }

    export function dateToStdString(date?: Date | null) {
        if (isNullOrUndefined(date)) {
            return undefined;
        }
        const year = date!.getUTCFullYear();
        const month = String(date!.getUTCMonth() + 1).padStart(2, '0'); // months are 0-based
        const day = String(date!.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    export function stdStringToDate(stdString?: string | null) {
        if (isNullOrUndefined(stdString)) {
            return undefined;
        }
        try {
            const date = new Date(stdString!);
            return new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            ));
        } catch (_e) {
            return undefined;
        }
    }

    export function formatDate(date: Date, separator = '/', isInverse = false, isUtc = false): string {
        if (isNullOrUndefined(date)) {
            return '';
        }
        let month = '' + ((isUtc ? date.getUTCMonth() : date.getMonth()) + 1);
        let day = '' + (isUtc ? date.getUTCDate() : date.getDate());
        const year = isUtc ? date.getUTCFullYear() : date.getFullYear();

        if (month.length < 2) { month = '0' + month; }
        if (day.length < 2) { day = '0' + day; }
        return isInverse ? [year, month, day].join(separator) : [day, month, year].join(separator);
    }

    export function formatTime(date: Date, isUtc = false): string {
        if (isNullOrUndefined(date)) {
            return '';
        }
        const hours = (isUtc ? date.getUTCHours() : date.getHours()).toString().padStart(2, '0');
        const minutes = (isUtc ? date.getUTCMinutes() : date.getMinutes()).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    export function formatDateTime(date: Date, separator = '/', isInverse = false, isUtc = false): string {
        if (isNullOrUndefined(date)) {
            return '';
        }
        return `${formatDate(date, separator, isInverse, isUtc)} ${formatTime(date, isUtc)}`;
    }

    export function formatDateInDdMmYy(date: Date, separator = '/'): string {
        const yearStr = date.getFullYear().toString();
        return [date.getDate(), date.getMonth() + 1, yearStr[2] + yearStr[3]].join(separator);
    }

    export function formatDateInDdMmYyHhMm(date: Date, separator = ', '): string {
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${formattedDate}${separator}${formattedTime}`;
    }

    export function formatDateInHHmmssSS(date: Date): string {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
    }

    export function getDateFromSecs(dateSecs: number): Date {
        return new Date(dateSecs * 1000);
    }

    export function getYearStartSecs(year: number): number {
        return new Date(`01-01-${year}`).getTime() / 1000;
    }

    export function getYearEndSecs(year: number): number {
        return new Date(`12-31-${year}`).getTime() / 1000;
    }

    export function utcDateToLocalDate(date?: Date): Date | undefined {
        if (!date) {
            return undefined;
        }
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    }

    export function localToUtc(date?: Date | null): Date | undefined {
        if (!date) {
            return undefined;
        }
        return new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ));
    }

    export function utcToLocal(date?: Date | null): Date | undefined {
        if (!date) {
            return undefined;
        }
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
    }

    export function minToMs(min: number): number { return secToMs(minToSec(min)); }
    export function minToSec(min: number): number { return min * 60; }
    export function dayToMin(days: number): number { return hourToMin(dayToHour(days)); }
    export function hourToMin(hours: number): number { return hours * 60; }
    export function dayToHour(days: number): number { return days * 24; }
    export function secToMin(sec: number): number { return sec / 60; }
    export function secToMs(sec: number): number { return sec * 1000; }
    export function msToSec(ms: number): number { return ms / 1000; }
    export function msToMin(ms: number): number { return secToMin(msToSec(ms)); }

    export function parseDate(dateStr: string, separator = '/', isInverse = false, isUtc = false): Date | null {
        const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^\\d{2}${escapedSeparator}\\d{2}${escapedSeparator}\\d{4}$`);
        if (!regex.test(dateStr)) {
            return null;
        }
        const [part1, part2, year] = dateStr.split(separator).map(Number);
        const day = isInverse ? part2 : part1;
        const month = isInverse ? part1 : part2;
        const date = isUtc ? new Date(Date.UTC(year, month - 1, day)) : new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
    }

    export function getUTCDateStringFormatFromSecTimestamp(secTimestamp?: number, locale: Intl.LocalesArgument = 'fr-FR'): string {
        const date = convertSecTimestampToDate(secTimestamp);
        return getUTCDateStringFormatFromDate(date, locale);
    }

    export function getUTCDateStringFormatFromDate(date?: Date, locale: Intl.LocalesArgument = 'fr-FR'): string {
        return date?.toLocaleDateString(locale, { timeZone: 'UTC' }) ?? '';
    }
}
