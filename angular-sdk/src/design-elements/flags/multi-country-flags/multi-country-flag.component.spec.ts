import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiCountryFlagComponent } from './multi-country-flag.component';
import { CountriesService } from '../../../global-services/countries.service';
import {TranslateModule} from '@ngx-translate/core';

describe('MultiCountryFlagComponent', () => {
    let component: MultiCountryFlagComponent;
    let fixture: ComponentFixture<MultiCountryFlagComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MultiCountryFlagComponent, TranslateModule.forRoot()],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiCountryFlagComponent);
        component = fixture.componentInstance;
        spyOn(CountriesService, 'getName').and.returnValue('Country Name');
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty countries array', () => {
            expect(component['__countries']).toEqual([]);
        });

        it('should initialize with hasAllCountries as false', () => {
            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should initialize rounded as false by default', () => {
            expect(component.rounded).toBe(false);
        });
    });

    describe('Input Bindings', () => {
        it('should accept countries input', () => {
            const countries = ['FR', 'DE', 'IT'];
            fixture.componentRef.setInput('countries', countries);
            expect(component['__countries']).toEqual(countries);
        });

        it('should accept rounded input', () => {
            fixture.componentRef.setInput('rounded', true);
            expect(component.rounded).toBe(true);
        });

        it('should accept size_rem input', () => {
            fixture.componentRef.setInput('size_rem', 2.5);
            expect(component.size_rem).toBe(2.5);
        });

        it('should handle multiple input changes together', () => {
            const countries = ['US', 'CA'];
            fixture.componentRef.setInput('countries', countries);
            fixture.componentRef.setInput('rounded', true);
            fixture.componentRef.setInput('size_rem', 3);

            expect(component['__countries']).toEqual(countries);
            expect(component.rounded).toBe(true);
            expect(component.size_rem).toBe(3);
        });
    });

    describe('countries setter', () => {
        it('should set __countries when countries input changes', () => {
            const countries = ['FR', 'DE'];
            fixture.componentRef.setInput('countries', countries);
            expect(component['__countries']).toEqual(countries);
        });

        it('should call CountriesService.containsAll when countries input changes', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            const countries = ['FR', 'DE'];

            fixture.componentRef.setInput('countries', countries);

            expect(CountriesService.containsAll).toHaveBeenCalledWith(countries);
        });

        it('should set __hasAllCountries to true when all countries are present', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(true);
            const countries = ['FR', 'DE'];

            fixture.componentRef.setInput('countries', countries);

            expect(component['__hasAllCountries']).toBe(true);
        });

        it('should set __hasAllCountries to false when not all countries are present', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            const countries = ['FR', 'DE'];

            fixture.componentRef.setInput('countries', countries);

            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should call markForCheck when countries input changes', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            fixture.componentRef.setInput('countries', ['FR']);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should update __hasAllCountries when countries array changes', () => {
            spyOn(CountriesService, 'containsAll').and.returnValues(false, true);

            fixture.componentRef.setInput('countries', ['FR', 'DE']);
            expect(component['__hasAllCountries']).toBe(false);

            fixture.componentRef.setInput('countries', ['FR', 'DE', 'IT', 'ES']);
            expect(component['__hasAllCountries']).toBe(true);
        });
    });

    describe('Template Rendering', () => {
        it('should render label-all-countries when hasAllCountries is true', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(true);
            fixture.componentRef.setInput('countries', ['FR', 'DE']);
            fixture.detectChanges();

            const labelAllCountries = fixture.nativeElement.querySelector('app-label-all-countries');
            const countryFlags = fixture.nativeElement.querySelectorAll('app-country-flag');

            expect(labelAllCountries).toBeTruthy();
            expect(countryFlags.length).toBe(0);
        });

        it('should render country flags when hasAllCountries is false', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', ['FR', 'DE', 'IT']);
            fixture.detectChanges();

            const labelAllCountries = fixture.nativeElement.querySelector('app-label-all-countries');
            const countryFlags = fixture.nativeElement.querySelectorAll('app-country-flag');

            expect(labelAllCountries).toBeFalsy();
            expect(countryFlags.length).toBe(3);
        });

        it('should render no flags when countries array is empty', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', []);
            fixture.detectChanges();

            const countryFlags = fixture.nativeElement.querySelectorAll('app-country-flag');
            expect(countryFlags.length).toBe(0);
        });

        it('should render correct number of flags for given countries', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', ['FR', 'DE', 'IT', 'ES', 'UK']);
            fixture.detectChanges();

            const countryFlags = fixture.nativeElement.querySelectorAll('app-country-flag');
            expect(countryFlags.length).toBe(5);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single country', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', ['FR']);

            expect(component['__countries']).toEqual(['FR']);
            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should handle empty countries array', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', []);

            expect(component['__countries']).toEqual([]);
            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should handle large number of countries', () => {
            const manyCountries = ['FR', 'DE', 'IT', 'ES', 'UK', 'US', 'CA', 'JP', 'CN', 'BR'];
            spyOn(CountriesService, 'containsAll').and.returnValue(false);

            fixture.componentRef.setInput('countries', manyCountries);

            expect(component['__countries']).toEqual(manyCountries);
            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should handle rounded true with countries', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', ['FR', 'DE']);
            fixture.componentRef.setInput('rounded', true);

            expect(component.rounded).toBe(true);
            expect(component['__countries']).toEqual(['FR', 'DE']);
        });

        it('should handle rounded false with countries', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            fixture.componentRef.setInput('countries', ['FR', 'DE']);
            fixture.componentRef.setInput('rounded', false);

            expect(component.rounded).toBe(false);
        });

        it('should handle size_rem with different values', () => {
            fixture.componentRef.setInput('size_rem', 1.5);
            expect(component.size_rem).toBe(1.5);

            fixture.componentRef.setInput('size_rem', 5);
            expect(component.size_rem).toBe(5);
        });

        it('should handle undefined size_rem', () => {
            fixture.componentRef.setInput('size_rem', undefined);
            expect(component.size_rem).toBeUndefined();
        });

        it('should update hasAllCountries multiple times when countries change', () => {
            spyOn(CountriesService, 'containsAll').and.returnValues(false, true, false);

            fixture.componentRef.setInput('countries', ['FR']);
            expect(component['__hasAllCountries']).toBe(false);

            fixture.componentRef.setInput('countries', ['FR', 'DE', 'IT']);
            expect(component['__hasAllCountries']).toBe(true);

            fixture.componentRef.setInput('countries', ['US']);
            expect(component['__hasAllCountries']).toBe(false);
        });

        it('should call markForCheck on every countries input change', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            fixture.componentRef.setInput('countries', ['FR']);
            fixture.componentRef.setInput('countries', ['DE']);
            fixture.componentRef.setInput('countries', ['IT']);

            expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(3);
        });

        it('should handle duplicate country codes', () => {
            spyOn(CountriesService, 'containsAll').and.returnValue(false);
            const countriesWithDuplicates = ['FR', 'FR', 'DE', 'DE'];

            fixture.componentRef.setInput('countries', countriesWithDuplicates);

            expect(component['__countries']).toEqual(countriesWithDuplicates);
        });
    });
});
