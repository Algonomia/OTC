import {DateUtils} from './dates';

describe('DateUtils', () => {
    describe('convertMsTimestampToSecTimestamp', () => {
        it('should_convert_milliseconds_to_seconds', () => {
            expect(DateUtils.convertMsTimestampToSecTimestamp(1000)).toBe(1);
        });

        it('should_floor_fractional_seconds', () => {
            expect(DateUtils.convertMsTimestampToSecTimestamp(1500)).toBe(1);
        });

        it('should_return_undefined_for_undefined', () => {
            expect(DateUtils.convertMsTimestampToSecTimestamp(undefined)).toBe(undefined);
        });

        it('should_return_zero_for_zero', () => {
            expect(DateUtils.convertMsTimestampToSecTimestamp(0)).toBe(0);
        });

        it('should_handle_large_timestamps', () => {
            expect(DateUtils.convertMsTimestampToSecTimestamp(1700000000000)).toBe(1700000000);
        });
    });

    describe('convertSecTimestampToMsTimestamp', () => {
        it('should_convert_seconds_to_milliseconds', () => {
            expect(DateUtils.convertSecTimestampToMsTimestamp(1)).toBe(1000);
        });

        it('should_return_undefined_for_undefined', () => {
            expect(DateUtils.convertSecTimestampToMsTimestamp(undefined)).toBe(undefined);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.convertSecTimestampToMsTimestamp(0)).toBe(0);
        });
    });

    describe('convertDateToSecTimestamp', () => {
        it('should_convert_date_to_seconds_timestamp', () => {
            const date = new Date(1700000000000);
            expect(DateUtils.convertDateToSecTimestamp(date)).toBe(1700000000);
        });

        it('should_return_undefined_for_null', () => {
            expect(DateUtils.convertDateToSecTimestamp(null)).toBe(undefined);
        });

        it('should_return_undefined_for_undefined', () => {
            expect(DateUtils.convertDateToSecTimestamp(undefined)).toBe(undefined);
        });
    });

    describe('convertSecTimestampToDate', () => {
        it('should_convert_seconds_timestamp_to_date', () => {
            const result = DateUtils.convertSecTimestampToDate(1700000000);
            expect(result).toEqual(new Date(1700000000000));
        });

        it('should_return_undefined_for_undefined_without_default', () => {
            expect(DateUtils.convertSecTimestampToDate(undefined)).toBe(undefined);
        });

        it('should_return_undefined_for_null_without_default', () => {
            expect(DateUtils.convertSecTimestampToDate(null)).toBe(undefined);
        });

        it('should_return_default_value_for_undefined_with_default', () => {
            const fallback = new Date(0);
            expect(DateUtils.convertSecTimestampToDate(undefined, fallback)).toBe(fallback);
        });

        it('should_return_default_value_for_null_with_default', () => {
            const fallback = new Date(0);
            expect(DateUtils.convertSecTimestampToDate(null, fallback)).toBe(fallback);
        });
    });

    describe('convertMsTimestampToDate', () => {
        it('should_convert_milliseconds_timestamp_to_date', () => {
            const result = DateUtils.convertMsTimestampToDate(1700000000000);
            expect(result).toEqual(new Date(1700000000000));
        });

        it('should_return_undefined_for_undefined_without_default', () => {
            expect(DateUtils.convertMsTimestampToDate(undefined)).toBe(undefined);
        });

        it('should_return_default_value_for_undefined_with_default', () => {
            const fallback = new Date(0);
            expect(DateUtils.convertMsTimestampToDate(undefined, fallback)).toBe(fallback);
        });
    });

    describe('dateToStdString', () => {
        it('should_format_date_as_yyyy_mm_dd', () => {
            const date = new Date(Date.UTC(2024, 0, 15));
            expect(DateUtils.dateToStdString(date)).toBe('2024-01-15');
        });

        it('should_pad_single_digit_month_and_day', () => {
            const date = new Date(Date.UTC(2024, 2, 5));
            expect(DateUtils.dateToStdString(date)).toBe('2024-03-05');
        });

        it('should_return_undefined_for_null', () => {
            expect(DateUtils.dateToStdString(null)).toBe(undefined);
        });

        it('should_return_undefined_for_undefined', () => {
            expect(DateUtils.dateToStdString(undefined)).toBe(undefined);
        });
    });

    describe('stdStringToDate', () => {
        it('should_parse_standard_date_string_to_utc_date', () => {
            const result = DateUtils.stdStringToDate('2024-01-15');
            expect(result).toEqual(new Date(Date.UTC(2024, 0, 15)));
        });

        it('should_return_undefined_for_null', () => {
            expect(DateUtils.stdStringToDate(null)).toBe(undefined);
        });

        it('should_return_undefined_for_undefined', () => {
            expect(DateUtils.stdStringToDate(undefined)).toBe(undefined);
        });
    });

    describe('formatDate', () => {
        it('should_format_utc_date_as_dd_slash_mm_slash_yyyy_by_default', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
            expect(DateUtils.formatDate(date, '/', false, true)).toBe('15/01/2024');
        });

        it('should_format_utc_date_with_custom_separator', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
            expect(DateUtils.formatDate(date, '-', false, true)).toBe('15-01-2024');
        });

        it('should_format_utc_date_in_inverse_order', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
            expect(DateUtils.formatDate(date, '/', true, true)).toBe('2024/01/15');
        });

        it('should_pad_single_digit_day_and_month', () => {
            const date = new Date(Date.UTC(2024, 2, 5, 12, 0, 0));
            expect(DateUtils.formatDate(date, '/', false, true)).toBe('05/03/2024');
        });

        it('should_return_empty_string_for_null_date', () => {
            expect(DateUtils.formatDate(null as unknown as Date)).toBe('');
        });
    });

    describe('formatTime', () => {
        it('should_format_utc_time_as_hh_mm', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 9, 5, 0));
            expect(DateUtils.formatTime(date, true)).toBe('09:05');
        });

        it('should_pad_single_digit_hours_and_minutes', () => {
            const date = new Date(Date.UTC(2024, 0, 1, 3, 7, 0));
            expect(DateUtils.formatTime(date, true)).toBe('03:07');
        });

        it('should_return_empty_string_for_null_date', () => {
            expect(DateUtils.formatTime(null as unknown as Date)).toBe('');
        });
    });

    describe('formatDateTime', () => {
        it('should_combine_date_and_time_in_utc', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 9, 30, 0));
            expect(DateUtils.formatDateTime(date, '/', false, true)).toBe('15/01/2024 09:30');
        });

        it('should_format_with_inverse_and_custom_separator_in_utc', () => {
            const date = new Date(Date.UTC(2024, 0, 15, 14, 45, 0));
            expect(DateUtils.formatDateTime(date, '-', true, true)).toBe('2024-01-15 14:45');
        });

        it('should_return_empty_string_for_null_date', () => {
            expect(DateUtils.formatDateTime(null as unknown as Date)).toBe('');
        });
    });

    describe('formatDateInDdMmYy', () => {
        it('should_format_date_as_d_m_yy_with_slash_separator', () => {
            const date = new Date(2024, 0, 15);
            expect(DateUtils.formatDateInDdMmYy(date)).toBe('15/1/24');
        });

        it('should_format_with_custom_separator', () => {
            const date = new Date(2024, 0, 15);
            expect(DateUtils.formatDateInDdMmYy(date, '-')).toBe('15-1-24');
        });
    });

    describe('minToMs', () => {
        it('should_convert_minutes_to_milliseconds', () => {
            expect(DateUtils.minToMs(1)).toBe(60000);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.minToMs(0)).toBe(0);
        });

        it('should_handle_fractional_minutes', () => {
            expect(DateUtils.minToMs(0.5)).toBe(30000);
        });
    });

    describe('minToSec', () => {
        it('should_convert_minutes_to_seconds', () => {
            expect(DateUtils.minToSec(1)).toBe(60);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.minToSec(0)).toBe(0);
        });
    });

    describe('dayToMin', () => {
        it('should_convert_days_to_minutes', () => {
            expect(DateUtils.dayToMin(1)).toBe(1440);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.dayToMin(0)).toBe(0);
        });
    });

    describe('hourToMin', () => {
        it('should_convert_hours_to_minutes', () => {
            expect(DateUtils.hourToMin(1)).toBe(60);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.hourToMin(0)).toBe(0);
        });
    });

    describe('dayToHour', () => {
        it('should_convert_days_to_hours', () => {
            expect(DateUtils.dayToHour(1)).toBe(24);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.dayToHour(0)).toBe(0);
        });

        it('should_handle_fractional_days', () => {
            expect(DateUtils.dayToHour(0.5)).toBe(12);
        });
    });

    describe('secToMin', () => {
        it('should_convert_seconds_to_minutes', () => {
            expect(DateUtils.secToMin(60)).toBe(1);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.secToMin(0)).toBe(0);
        });

        it('should_return_fractional_minutes', () => {
            expect(DateUtils.secToMin(90)).toBe(1.5);
        });
    });

    describe('secToMs', () => {
        it('should_convert_seconds_to_milliseconds', () => {
            expect(DateUtils.secToMs(1)).toBe(1000);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.secToMs(0)).toBe(0);
        });
    });

    describe('msToSec', () => {
        it('should_convert_milliseconds_to_seconds', () => {
            expect(DateUtils.msToSec(1000)).toBe(1);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.msToSec(0)).toBe(0);
        });

        it('should_return_fractional_seconds', () => {
            expect(DateUtils.msToSec(1500)).toBe(1.5);
        });
    });

    describe('msToMin', () => {
        it('should_convert_milliseconds_to_minutes', () => {
            expect(DateUtils.msToMin(60000)).toBe(1);
        });

        it('should_handle_zero', () => {
            expect(DateUtils.msToMin(0)).toBe(0);
        });

        it('should_return_fractional_minutes', () => {
            expect(DateUtils.msToMin(90000)).toBe(1.5);
        });
    });

    describe('parseDate', () => {
        it('should_parse_dd_slash_mm_slash_yyyy_format', () => {
            const result = DateUtils.parseDate('15/01/2024');
            expect(result).toEqual(new Date(2024, 0, 15));
        });

        it('should_parse_with_custom_separator', () => {
            const result = DateUtils.parseDate('15-01-2024', '-');
            expect(result).toEqual(new Date(2024, 0, 15));
        });

        it('should_parse_inverse_format_mm_sep_dd_sep_yyyy', () => {
            const result = DateUtils.parseDate('01/15/2024', '/', true);
            expect(result).toEqual(new Date(2024, 0, 15));
        });

        it('should_parse_utc_date', () => {
            const result = DateUtils.parseDate('15/01/2024', '/', false, true);
            expect(result).toEqual(new Date(Date.UTC(2024, 0, 15)));
        });

        it('should_return_null_for_invalid_format', () => {
            expect(DateUtils.parseDate('2024-01-15')).toBe(null);
        });

        it('should_return_null_for_incomplete_date', () => {
            expect(DateUtils.parseDate('15/01')).toBe(null);
        });

        it('should_return_null_for_empty_string', () => {
            expect(DateUtils.parseDate('')).toBe(null);
        });

        it('should_return_null_for_wrong_digit_count', () => {
            expect(DateUtils.parseDate('1/1/2024')).toBe(null);
        });

        it('should_handle_separator_with_regex_special_characters', () => {
            const result = DateUtils.parseDate('15.01.2024', '.');
            expect(result).toEqual(new Date(2024, 0, 15));
        });
    });
});
