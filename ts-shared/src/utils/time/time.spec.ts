import { TimeUtils, TimeUnit } from './time';

describe('TimeUtils', () => {
    describe('toMs', () => {
        it('returns time unchanged if timeUnit is undefined', () => {
            expect(TimeUtils.toMs(500)).toBe(500);
        });

        it('returns time unchanged if time is undefined', () => {
            expect(TimeUtils.toMs(undefined, TimeUnit.seconds)).toBe(undefined);
        });

        it('returns time as-is for milliseconds unit', () => {
            expect(TimeUtils.toMs(100, TimeUnit.milliseconds)).toBe(100);
        });

        it('converts seconds to ms', () => {
            expect(TimeUtils.toMs(2, TimeUnit.seconds)).toBe(2000);
        });

        it('converts minutes to ms', () => {
            expect(TimeUtils.toMs(1, TimeUnit.minutes)).toBe(60000);
        });

        it('converts hours to ms', () => {
            expect(TimeUtils.toMs(1, TimeUnit.hours)).toBe(3600000);
        });

        it('converts days to ms', () => {
            expect(TimeUtils.toMs(1, TimeUnit.days)).toBe(86400000);
        });

        it('converts weeks to ms', () => {
            expect(TimeUtils.toMs(1, TimeUnit.weeks)).toBe(604800000);
        });

        it('returns 0 for time=0', () => {
            expect(TimeUtils.toMs(0, TimeUnit.seconds)).toBe(0);
        });
    });

    describe('toSecs', () => {
        it('returns time unchanged if timeUnit is undefined', () => {
            expect(TimeUtils.toSecs(500)).toBe(500);
        });

        it('returns time unchanged if time is undefined', () => {
            expect(TimeUtils.toSecs(undefined, TimeUnit.seconds)).toBe(undefined);
        });

        it('converts ms to seconds with floor', () => {
            expect(TimeUtils.toSecs(1500, TimeUnit.milliseconds)).toBe(1);
        });

        it('returns time as-is for seconds unit', () => {
            expect(TimeUtils.toSecs(10, TimeUnit.seconds)).toBe(10);
        });

        it('converts minutes to seconds', () => {
            expect(TimeUtils.toSecs(2, TimeUnit.minutes)).toBe(120);
        });

        it('converts hours to seconds', () => {
            expect(TimeUtils.toSecs(1, TimeUnit.hours)).toBe(3600);
        });

        it('converts days to seconds', () => {
            expect(TimeUtils.toSecs(1, TimeUnit.days)).toBe(86400);
        });

        it('converts weeks to seconds', () => {
            expect(TimeUtils.toSecs(1, TimeUnit.weeks)).toBe(604800);
        });
    });

    describe('toMinutes', () => {
        it('returns time unchanged if timeUnit is undefined', () => {
            expect(TimeUtils.toMinutes(500)).toBe(500);
        });

        it('returns time unchanged if time is undefined', () => {
            expect(TimeUtils.toMinutes(undefined, TimeUnit.minutes)).toBe(undefined);
        });

        it('converts ms to minutes with floor', () => {
            expect(TimeUtils.toMinutes(90000, TimeUnit.milliseconds)).toBe(1);
        });

        it('converts seconds to minutes with floor', () => {
            expect(TimeUtils.toMinutes(150, TimeUnit.seconds)).toBe(2);
        });

        it('returns time as-is for minutes unit', () => {
            expect(TimeUtils.toMinutes(5, TimeUnit.minutes)).toBe(5);
        });

        it('converts hours to minutes', () => {
            expect(TimeUtils.toMinutes(2, TimeUnit.hours)).toBe(120);
        });

        it('converts days to minutes', () => {
            expect(TimeUtils.toMinutes(1, TimeUnit.days)).toBe(1440);
        });

        it('converts weeks to minutes', () => {
            expect(TimeUtils.toMinutes(1, TimeUnit.weeks)).toBe(10080);
        });
    });

    describe('toMinutesAndSeconds', () => {
        it('returns {0, 0} if time is 0', () => {
            expect(TimeUtils.toMinutesAndSeconds(0)).toEqual({minutes: 0, seconds: 0});
        });

        it('returns {0, 0} if time is undefined', () => {
            expect(TimeUtils.toMinutesAndSeconds(undefined)).toEqual({minutes: 0, seconds: 0});
        });

        it('converts 90000ms to 1 minute and 30 seconds', () => {
            expect(TimeUtils.toMinutesAndSeconds(90000, TimeUnit.milliseconds)).toEqual({minutes: 1, seconds: 30});
        });

        it('converts 61 seconds to 1 minute and 1 second', () => {
            expect(TimeUtils.toMinutesAndSeconds(61, TimeUnit.seconds)).toEqual({minutes: 1, seconds: 1});
        });

        it('converts 120 seconds to 2 minutes and 0 seconds', () => {
            expect(TimeUtils.toMinutesAndSeconds(120000, TimeUnit.milliseconds)).toEqual({minutes: 2, seconds: 0});
        });
    });

    describe('toOverflowSecsFromMinute', () => {
        it('returns overflow seconds from ms', () => {
            expect(TimeUtils.toOverflowSecsFromMinute(90000, TimeUnit.milliseconds)).toBe(30);
        });

        it('returns 0 for exact minute in seconds', () => {
            expect(TimeUtils.toOverflowSecsFromMinute(120, TimeUnit.seconds)).toBe(0);
        });

        it('returns time unchanged if time is 0', () => {
            expect(TimeUtils.toOverflowSecsFromMinute(0)).toBe(0);
        });

        it('returns time unchanged if time is undefined', () => {
            expect(TimeUtils.toOverflowSecsFromMinute(undefined)).toBe(undefined);
        });
    });

    describe('computeTimeDiffInDay', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('returns days (plural) for diff >= 2 days', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(2 * 86400000);
            expect(result.number).toBe(2);
            expect(result.text).toBe('Shared.PeriodUnit.Plural.Days');
        });

        it('returns day (singular) for diff of exactly 1 day', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(86400000);
            expect(result.number).toBe(1);
            expect(result.text).toBe('Shared.PeriodUnit.Singular.Day');
        });

        it('returns hours (plural) for diff >= 2 hours', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(2 * 3600000);
            expect(result.number).toBe(2);
            expect(result.text).toBe('Shared.PeriodUnit.Plural.Hours');
        });

        it('returns hour (singular) for diff of exactly 1 hour', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(3600000);
            expect(result.number).toBe(1);
            expect(result.text).toBe('Shared.PeriodUnit.Singular.Hour');
        });

        it('returns minutes (plural) for diff >= 2 minutes', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(2 * 60000);
            expect(result.number).toBe(2);
            expect(result.text).toBe('Shared.PeriodUnit.Plural.Minutes');
        });

        it('returns minute (singular) for diff of exactly 1 minute', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(60000);
            expect(result.number).toBe(1);
            expect(result.text).toBe('Shared.PeriodUnit.Singular.Minute');
        });

        it('returns seconds (plural) for diff < 1 minute and > 1 second', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(30000);
            expect(result.number).toBe(30);
            expect(result.text).toBe('Shared.PeriodUnit.Plural.Seconds');
        });

        it('returns second (singular) for diff of exactly 1 second', () => {
            jest.spyOn(Date, 'now').mockReturnValue(0);
            const result = TimeUtils.computeTimeDiffInDay(1000);
            expect(result.number).toBe(1);
            expect(result.text).toBe('Shared.PeriodUnit.Singular.Second');
        });

        it('uses absolute difference for past timestamps', () => {
            jest.spyOn(Date, 'now').mockReturnValue(86400000);
            const result = TimeUtils.computeTimeDiffInDay(0);
            expect(result.number).toBe(1);
            expect(result.text).toBe('Shared.PeriodUnit.Singular.Day');
        });
    });
});
