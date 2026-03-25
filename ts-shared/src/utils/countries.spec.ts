import { CountriesUtils } from './countries';

describe('CountriesUtils', () => {
    describe('iso2List', () => {
        it('returns an array of strings', () => {
            const list = CountriesUtils.iso2List;
            expect(Array.isArray(list)).toBe(true);
            expect(list.length).toBeGreaterThan(0);
        });

        it('contains known ISO2 country codes', () => {
            const list = CountriesUtils.iso2List;
            expect(list).toContain('FR');
            expect(list).toContain('US');
            expect(list).toContain('DE');
        });

        it('contains only 2-letter codes', () => {
            const list = CountriesUtils.iso2List;
            list.forEach(code => {
                expect(code.length).toBe(2);
            });
        });
    });

    describe('iso2Set', () => {
        it('returns a Set', () => {
            const set = CountriesUtils.iso2Set;
            expect(set).toBeInstanceOf(Set);
        });

        it('has the same size as iso2List', () => {
            expect(CountriesUtils.iso2Set.size).toBe(CountriesUtils.iso2List.length);
        });

        it('contains known ISO2 codes', () => {
            const set = CountriesUtils.iso2Set;
            expect(set.has('FR')).toBe(true);
            expect(set.has('US')).toBe(true);
        });
    });

    describe('getName', () => {
        it('returns the country name in English', () => {
            expect(CountriesUtils.getName('FR', 'en')).toBe('France');
        });

        it('returns the country name in French', () => {
            expect(CountriesUtils.getName('DE', 'fr')).toBe('Allemagne');
        });

        it('returns empty string for an invalid code', () => {
            expect(CountriesUtils.getName('ZZ', 'en')).toBe('');
        });

        it('returns empty string for an empty code', () => {
            expect(CountriesUtils.getName('', 'en')).toBe('');
        });
    });

    describe('containsAll', () => {
        it('returns true when list matches all ISO2 codes', () => {
            const fullList = CountriesUtils.iso2List;
            expect(CountriesUtils.containsAll(fullList)).toBe(true);
        });

        it('returns false when list has fewer items', () => {
            expect(CountriesUtils.containsAll(['FR', 'US'])).toBe(false);
        });

        it('returns false when list has same length but different codes', () => {
            const list = CountriesUtils.iso2List.slice();
            list[0] = 'ZZ';
            expect(CountriesUtils.containsAll(list)).toBe(false);
        });

        it('returns false for an empty list', () => {
            expect(CountriesUtils.containsAll([])).toBe(false);
        });
    });
});
