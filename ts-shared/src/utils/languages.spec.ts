import { LanguagesUtils } from './languages';

describe('LanguagesUtils', () => {
    describe('getAllLanguages', () => {
        it('returns an array of strings', () => {
            const languages = LanguagesUtils.getAllLanguages();
            expect(Array.isArray(languages)).toBe(true);
            languages.forEach(lang => {
                expect(typeof lang).toBe('string');
            });
        });

        it('contains known language codes', () => {
            const languages = LanguagesUtils.getAllLanguages();
            expect(languages).toContain('en');
            expect(languages).toContain('fr');
            expect(languages).toContain('de');
            expect(languages).toContain('es');
        });

        it('returns a new array each time', () => {
            const a = LanguagesUtils.getAllLanguages();
            const b = LanguagesUtils.getAllLanguages();
            expect(a).not.toBe(b);
            expect(a).toEqual(b);
        });
    });

    describe('getLanguageName', () => {
        it('returns capitalized English name for a valid code', () => {
            const name = LanguagesUtils.getLanguageName('fr');
            expect(typeof name).toBe('string');
            expect(name.length).toBeGreaterThan(0);
            expect(name[0]).toBe(name[0].toUpperCase());
        });

        it('returns the code itself for an unsupported code', () => {
            expect(LanguagesUtils.getLanguageName('xx')).toBe('xx');
        });

        it('returns a name using a specific display language', () => {
            const name = LanguagesUtils.getLanguageName('en', 'fr');
            expect(typeof name).toBe('string');
            expect(name.length).toBeGreaterThan(0);
        });

        it('defaults to English display language', () => {
            const name = LanguagesUtils.getLanguageName('fr');
            expect(name).toBe('French');
        });
    });

    describe('LangStringSchema', () => {
        it('accepts a valid language code', () => {
            const result = LanguagesUtils.LangStringSchema.safeParse('en');
            expect(result.success).toBe(true);
        });

        it('accepts another valid language code', () => {
            const result = LanguagesUtils.LangStringSchema.safeParse('fr');
            expect(result.success).toBe(true);
        });

        it('rejects an unsupported language code', () => {
            const result = LanguagesUtils.LangStringSchema.safeParse('xx');
            expect(result.success).toBe(false);
        });

        it('rejects a non-string value', () => {
            const result = LanguagesUtils.LangStringSchema.safeParse(123);
            expect(result.success).toBe(false);
        });

        it('rejects an empty string', () => {
            const result = LanguagesUtils.LangStringSchema.safeParse('');
            expect(result.success).toBe(false);
        });
    });
});
