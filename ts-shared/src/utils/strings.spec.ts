import { StringUtils } from './strings';

describe('StringUtils', () => {
    describe('cropText', () => {
        it('returns text unchanged when shorter than maxLength', () => {
            expect(StringUtils.cropText('hello', 10)).toBe('hello');
        });

        it('returns text unchanged when length equals maxLength', () => {
            expect(StringUtils.cropText('hello', 5)).toBe('hello');
        });

        it('crops text and appends trailing when longer than maxLength', () => {
            expect(StringUtils.cropText('hello world', 5)).toBe('hello...');
        });

        it('uses default maxLength of 60', () => {
            const shortText = 'a'.repeat(60);
            expect(StringUtils.cropText(shortText)).toBe(shortText);

            const longText = 'a'.repeat(61);
            expect(StringUtils.cropText(longText)).toBe('a'.repeat(60) + '...');
        });

        it('uses a custom trailing string', () => {
            expect(StringUtils.cropText('hello world', 5, '---')).toBe('hello---');
        });

        it('handles empty string', () => {
            expect(StringUtils.cropText('', 5)).toBe('');
        });
    });

    describe('cropTextMiddle', () => {
        it('returns uncropped result when text fits within maxLength plus trailing length', () => {
            const result = StringUtils.cropTextMiddle('hello', 10);
            expect(result.cropped_text).toBe('hello');
            expect(result.is_cropped).toBe(false);
        });

        it('returns cropped result when text exceeds maxLength plus trailing length', () => {
            const text = 'abcdefghijklmnopqrstuvwxyz';
            const result = StringUtils.cropTextMiddle(text, 10);
            expect(result.is_cropped).toBe(true);
            expect(result.cropped_text.length).toBeLessThan(text.length);
        });

        it('sets is_cropped to false when text length minus trailing length equals maxLength', () => {
            const text = 'a'.repeat(13);
            const result = StringUtils.cropTextMiddle(text, 10);
            expect(result.is_cropped).toBe(false);
            expect(result.cropped_text).toBe(text);
        });

        it('preserves start and end of the original text when cropped', () => {
            const text = 'abcdefghijklmnopqrstuvwxyz';
            const result = StringUtils.cropTextMiddle(text, 10);
            expect(result.cropped_text.startsWith('abcde')).toBe(true);
            expect(result.cropped_text.endsWith('uvwxyz')).toBe(true);
        });

        it('uses a custom trailing string', () => {
            const text = 'abcdefghijklmnopqrstuvwxyz';
            const result = StringUtils.cropTextMiddle(text, 10, '---');
            expect(result.is_cropped).toBe(true);
            expect(result.cropped_text).toContain('---');
        });
    });

    describe('sliceTextMiddle', () => {
        it('returns first half, trailing, and last half', () => {
            const result = StringUtils.sliceTextMiddle('abcdefghij', 4);
            expect(result).toBe('ab...hij');
        });

        it('uses default maxLength of 60', () => {
            const text = 'a'.repeat(100);
            const result = StringUtils.sliceTextMiddle(text);
            expect(result).toContain('...');
        });

        it('uses a custom trailing string', () => {
            const result = StringUtils.sliceTextMiddle('abcdefghijklmnop', 6, '---');
            expect(result).toContain('---');
        });

        it('includes the correct portions of start and end', () => {
            const result = StringUtils.sliceTextMiddle('0123456789', 6);
            const firstHalf = '0123456789'.slice(0, Math.floor(6 / 2));
            const secondHalf = '0123456789'.slice(10 - Math.floor(6 / 2 + 1));
            expect(result).toBe(firstHalf + '...' + secondHalf);
        });
    });
});
