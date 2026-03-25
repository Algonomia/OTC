import { TestBed } from '@angular/core/testing';
import { CountriesService } from './countries.service';

describe('CountriesService', () => {
    let service: CountriesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CountriesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getName', () => {
        it('should return country name in French when lang is fr', () => {
            const name = CountriesService.getName('FR', 'fr');
            expect(name).toBe('France');
        });

        it('should return country name in French for Germany', () => {
            const name = CountriesService.getName('DE', 'fr');
            expect(name).toBe('Allemagne');
        });

        it('should return country name in English for Germany', () => {
            const name = CountriesService.getName('DE', 'en');
            expect(name).toBe('Germany');
        });

        it('should return empty string for invalid ISO2 code', () => {
            const name = CountriesService.getName('INVALID', 'fr');
            expect(name).toBe('');
        });

        it('should return empty string for empty ISO2 code', () => {
            const name = CountriesService.getName('', 'fr');
            expect(name).toBe('');
        });

        it('should handle lowercase ISO2 codes', () => {
            const name = CountriesService.getName('fr', 'en');
            expect(name).toBe('France');
        });

        it('should return country name for Spain in French', () => {
            const name = CountriesService.getName('ES', 'fr');
            expect(name).toBe('Espagne');
        });

        it('should return country name for Spain in English', () => {
            const name = CountriesService.getName('ES', 'en');
            expect(name).toBe('Spain');
        });

        it('should return country name for Italy in French', () => {
            const name = CountriesService.getName('IT', 'fr');
            expect(name).toBe('Italie');
        });

        it('should return country name for Italy in English', () => {
            const name = CountriesService.getName('IT', 'en');
            expect(name).toBe('Italy');
        });

        it('should return country name for United States in French', () => {
            const name = CountriesService.getName('US', 'fr');
            expect(name).toBe('États-Unis d\'Amérique');
        });

        it('should return country name for United States in English', () => {
            const name = CountriesService.getName('US', 'en');
            expect(name).toBe('United States of America');
        });
    });

    describe('iso2List', () => {
        it('should return an array of ISO2 codes', () => {
            const list = CountriesService.iso2List;
            expect(Array.isArray(list)).toBe(true);
        });

        it('should return a non-empty array', () => {
            const list = CountriesService.iso2List;
            expect(list.length).toBeGreaterThan(0);
        });

        it('should contain common country codes', () => {
            const list = CountriesService.iso2List;
            expect(list).toContain('FR');
            expect(list).toContain('GB');
        });

        it('should return uppercase ISO2 codes', () => {
            const list = CountriesService.iso2List;
            const allUppercase = list.every(code => code === code.toUpperCase());
            expect(allUppercase).toBe(true);
        });

        it('should return ISO2 codes with length 2', () => {
            const list = CountriesService.iso2List;
            const allLength2 = list.every(code => code.length === 2);
            expect(allLength2).toBe(true);
        });
    });

    describe('iso2Set', () => {
        it('should return a Set of ISO2 codes', () => {
            const set = CountriesService.iso2Set;
            expect(set instanceof Set).toBe(true);
        });

        it('should return a non-empty Set', () => {
            const set = CountriesService.iso2Set;
            expect(set.size).toBeGreaterThan(0);
        });

        it('should contain common country codes', () => {
            const set = CountriesService.iso2Set;
            expect(set.has('FR')).toBe(true);
            expect(set.has('GB')).toBe(true);
        });

        it('should have same size as iso2List', () => {
            const list = CountriesService.iso2List;
            const set = CountriesService.iso2Set;
            expect(set.size).toBe(list.length);
        });

        it('should not contain invalid codes', () => {
            const set = CountriesService.iso2Set;
            expect(set.has('INVALID')).toBe(false);
            expect(set.has('XX')).toBe(false);
        });
    });

    describe('containsAll', () => {
        it('should return true when list contains all valid ISO2 codes', () => {
            const allCodes = CountriesService.iso2List;
            const result = CountriesService.containsAll(allCodes);
            expect(result).toBe(true);
        });

        it('should return false when list is shorter than all codes', () => {
            const result = CountriesService.containsAll(['FR', 'DE', 'US']);
            expect(result).toBe(false);
        });

        it('should return false when list is longer than all codes', () => {
            const allCodes = CountriesService.iso2List;
            const longerList = [...allCodes, 'EXTRA'];
            const result = CountriesService.containsAll(longerList);
            expect(result).toBe(false);
        });

        it('should return false when list contains invalid code', () => {
            const allCodes = CountriesService.iso2List;
            const invalidList = [...allCodes.slice(0, -1), 'INVALID'];
            const result = CountriesService.containsAll(invalidList);
            expect(result).toBe(false);
        });

        it('should return false for empty list', () => {
            const result = CountriesService.containsAll([]);
            expect(result).toBe(false);
        });

        it('should return false when list has duplicates', () => {
            const allCodes = CountriesService.iso2List;
            const duplicateList = [...allCodes, 'FR'];
            const result = CountriesService.containsAll(duplicateList);
            expect(result).toBe(false);
        });

        it('should return false when list has different codes but same length', () => {
            const allCodes = CountriesService.iso2List;
            const modifiedList = [...allCodes];
            modifiedList[0] = 'XX';
            const result = CountriesService.containsAll(modifiedList);
            expect(result).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null ISO2 code gracefully', () => {
            const name = CountriesService.getName(null as any, 'fr');
            expect(name).toBe('');
        });

        it('should handle undefined ISO2 code gracefully', () => {
            const name = CountriesService.getName(undefined as any, 'fr');
            expect(name).toBe('');
        });

        it('should handle numeric ISO2 code gracefully', () => {
            const name = CountriesService.getName('123' as any, 'fr');
            expect(name).toBe('');
        });

        it('should handle special characters in ISO2 code gracefully', () => {
            const name = CountriesService.getName('@#' as any, 'fr');
            expect(name).toBe('');
        });
    });
});
