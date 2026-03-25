export enum TimeUnit {
    milliseconds = 'milliseconds',
    seconds = 'seconds',
    minutes = 'minutes',
    hours = 'hours',
    days = 'days',
    weeks = 'weeks'
}

export namespace TimeUtils {
    export const days_in_week = 7;
    export const hours_in_day = 24;
    export const minutes_in_hour = 60;
    export const seconds_in_minute = 60;
    export const ms_in_seconds = 1000;
    export const seconds_in_ms = 0.001;

    export const minutes_in_day = minutes_in_hour * hours_in_day;
    export const minutes_in_week = days_in_week * minutes_in_day;

    export const seconds_in_hour = seconds_in_minute * minutes_in_hour;
    export const seconds_in_day = seconds_in_hour * hours_in_day;
    export const seconds_in_week = seconds_in_day * days_in_week;

    export const ms_in_minute = ms_in_seconds * seconds_in_minute;
    export const ms_in_hour = ms_in_minute * minutes_in_hour;
    export const ms_in_day = ms_in_hour * hours_in_day;
    export const ms_in_week = ms_in_day * days_in_week;

    export function toMs(time?: number, timeUnit?: TimeUnit) {
        if (!time || !timeUnit) {
            return time;
        }
        switch (timeUnit) {
            case TimeUnit.milliseconds: return time;
            case TimeUnit.seconds: return ms_in_seconds * time;
            case TimeUnit.minutes: return ms_in_minute * time;
            case TimeUnit.hours: return ms_in_hour * time;
            case TimeUnit.days: return ms_in_day * time;
            case TimeUnit.weeks: return ms_in_week * time;
        }
        return time;
    }

    export function toSecs(time?: number, timeUnit?: TimeUnit) {
        if (!time || !timeUnit) {
            return time;
        }
        switch (timeUnit) {
            case TimeUnit.milliseconds: return Math.floor(seconds_in_ms * time);
            case TimeUnit.seconds: return time;
            case TimeUnit.minutes: return seconds_in_minute * time;
            case TimeUnit.hours: return seconds_in_hour * time;
            case TimeUnit.days: return seconds_in_day * time;
            case TimeUnit.weeks: return seconds_in_week * time;
        }
        return time;
    }

    export function toMinutes(time?: number, timeUnit?: TimeUnit) {
        if (!time || !timeUnit) {
            return time;
        }
        switch (timeUnit) {
            case TimeUnit.milliseconds: return Math.floor(time / ms_in_minute);
            case TimeUnit.seconds: return Math.floor(time / seconds_in_minute);
            case TimeUnit.minutes: return time;
            case TimeUnit.hours: return time * minutes_in_hour;
            case TimeUnit.days: return time * minutes_in_day;
            case TimeUnit.weeks: return time * minutes_in_week;
        }
    }

    export function toMinutesAndSeconds(time?: number, timeUnit: TimeUnit = TimeUnit.milliseconds) {
        if (!time) {
            return { minutes: 0, seconds: 0 };
        }

        const minutes = toMinutes(time, timeUnit)!;
        const seconds = toOverflowSecsFromMinute(time, timeUnit)!;

        return { minutes, seconds };
    }

    export function toOverflowSecsFromMinute(time?: number, timeUnit: TimeUnit = TimeUnit.milliseconds) {
        if (!time || !timeUnit) {
            return time;
        }
        return toSecs(time, timeUnit)! % seconds_in_minute;
    }

    export function computeTimeDiffInDay(timestamp: number) {
        const singular = {
            second: 'Shared.PeriodUnit.Singular.Second',
            minute: 'Shared.PeriodUnit.Singular.Minute',
            hour: 'Shared.PeriodUnit.Singular.Hour',
            day: 'Shared.PeriodUnit.Singular.Day',
        };

        const plural = {
            second: 'Shared.PeriodUnit.Plural.Seconds',
            minute: 'Shared.PeriodUnit.Plural.Minutes',
            hour: 'Shared.PeriodUnit.Plural.Hours',
            day: 'Shared.PeriodUnit.Plural.Days',
        };

        const diffMs = Math.abs(timestamp - Date.now());

        const seconds = Math.floor(diffMs / TimeUtils.ms_in_seconds);
        const minutes = Math.floor(diffMs / TimeUtils.ms_in_minute);
        const hours = Math.floor(diffMs / TimeUtils.ms_in_hour);
        const days = Math.floor(diffMs / TimeUtils.ms_in_day);

        if (days >= 1) {
            return {
                number: days,
                text: days > 1 ? plural.day : singular.day
            };
        } else if (hours >= 1) {
            return {
                number: hours,
                text: hours > 1 ? plural.hour : singular.hour
            };
        } else if (minutes >= 1) {
            return {
                number: minutes,
                text: minutes > 1 ? plural.minute : singular.minute
            };
        } else {
            return {
                number: seconds,
                text: seconds > 1 ? plural.second : singular.second
            };
        }
    }
}
