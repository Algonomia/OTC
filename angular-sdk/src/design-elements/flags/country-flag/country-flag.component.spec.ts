import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryFlagComponent } from './country-flag.component';
import { CountriesService } from '../../../global-services/countries.service';
import { LanguagesUtils } from '@algonomia/ts-shared';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('CountryFlagComponent', () => {
    let component: CountryFlagComponent;
    let fixture: ComponentFixture<CountryFlagComponent>;
    let translateService: TranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CountryFlagComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CountryFlagComponent);
        component = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);

        spyOn(CountriesService, 'getName').and.returnValue('France');
        spyOn(LanguagesUtils, 'getLanguageName').and.returnValue('French');
        translateService.use('en');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have default hideNameMobile as false', () => {
            expect(component.hideNameMobile).toBe(false);
        });

        it('should have default rounded as false', () => {
            expect(component.rounded).toBe(false);
        });

        it('should have default display as empty string', () => {
            expect(component.display).toBe('');
        });
    });

    describe('iso2 setter - Business Logic', () => {
        it('should set __iso2 property', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component.__iso2).toBe('FR');
        });

        it('should transform iso2 to lowercase for country class', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component.__countryClass).toBe('fi-fr');
        });

        it('should update country class when iso2 changes', () => {
            fixture.componentRef.setInput('iso2', 'DE');
            expect(component.__countryClass).toBe('fi-de');

            fixture.componentRef.setInput('iso2', 'IT');
            expect(component.__countryClass).toBe('fi-it');
        });

        it('should call _setDisplay when iso2 is set', () => {
            spyOn<any>(component, '_setDisplay');
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['_setDisplay']).toHaveBeenCalled();
        });

        it('should handle uppercase iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component.__iso2).toBe('FR');
            expect(component.__countryClass).toBe('fi-fr');
        });

        it('should handle lowercase iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'fr');
            expect(component.__iso2).toBe('fr');
            expect(component.__countryClass).toBe('fi-fr');
        });

        it('should handle mixed case iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'Fr');
            expect(component.__iso2).toBe('Fr');
            expect(component.__countryClass).toBe('fi-fr');
        });

        it('should call _setDisplay multiple times when iso2 changes', () => {
            spyOn<any>(component, '_setDisplay');

            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('iso2', 'DE');
            fixture.componentRef.setInput('iso2', 'IT');

            expect(component['_setDisplay']).toHaveBeenCalledTimes(3);
        });
    });

    describe('_setDisplay method - Service Integration', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should call LanguagesUtils.getLanguageName with correct parameters', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(LanguagesUtils.getLanguageName).toHaveBeenCalledWith('fr', 'en');
        });

        it('should set __lang from LanguagesUtils', () => {
            (LanguagesUtils.getLanguageName as jasmine.Spy).and.returnValue('French');
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component.__lang).toBe('French');
        });

        it('should call CountriesService.getName with iso2', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(CountriesService.getName).toHaveBeenCalledWith('FR', jasmine.anything());
        });

        it('should set __name from CountriesService', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('France');
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component.__name).toBe('France');
        });

        it('should call markForCheck for change detection', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            fixture.componentRef.setInput('iso2', 'FR');

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should update both __lang and __name', () => {
            (LanguagesUtils.getLanguageName as jasmine.Spy).and.returnValue('German');
            (CountriesService.getName as jasmine.Spy).and.returnValue('Germany');

            fixture.componentRef.setInput('iso2', 'DE');

            expect(component.__lang).toBe('German');
            expect(component.__name).toBe('Germany');
        });
    });

    describe('ngOnInit - Language Change Subscription', () => {
        it('should call _setDisplay when language changes', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.detectChanges();

            spyOn<any>(component, '_setDisplay');
            translateService.use('fr');

            expect(component['_setDisplay']).toHaveBeenCalled();
        });
    });

    describe('Conditional CSS Classes', () => {
        it('should apply rounded class when rounded is true', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('rounded', true);
            fixture.detectChanges();

            const flag = fixture.nativeElement.querySelector('.flag');
            expect(flag.classList.contains('rounded')).toBe(true);
        });

        it('should not apply rounded class when rounded is false', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('rounded', false);
            fixture.detectChanges();

            const flag = fixture.nativeElement.querySelector('.flag');
            expect(flag.classList.contains('rounded')).toBe(false);
        });

        it('should apply hide-mobile class when hideNameMobile is true and display is set', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', 'name');
            fixture.componentRef.setInput('hideNameMobile', true);
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement.classList.contains('hide-mobile')).toBe(true);
        });

        it('should not apply hide-mobile class when hideNameMobile is false', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', 'name');
            fixture.componentRef.setInput('hideNameMobile', false);
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement.classList.contains('hide-mobile')).toBe(false);
        });
    });

    describe('Display Mode - Conditional Rendering', () => {
        it('should render name when display is name', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', 'name');
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement).toBeTruthy();
        });

        it('should render language when display is lang', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', 'lang');
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement).toBeTruthy();
        });

        it('should render iso2 when display is iso2', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', 'iso2');
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement).toBeTruthy();
        });

        it('should not render name when display is empty', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('display', '');
            fixture.detectChanges();

            const nameElement = fixture.nativeElement.querySelector('.name');
            expect(nameElement).toBeFalsy();
        });
    });

    describe('Edge Cases', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should handle empty string iso2', () => {
            fixture.componentRef.setInput('iso2', '');
            expect(component.__iso2).toBe('');
            expect(component.__countryClass).toBe('fi-');
        });

        it('should handle invalid iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'XX');
            expect(component.__iso2).toBe('XX');
            expect(component.__countryClass).toBe('fi-xx');
        });

        it('should handle special characters in iso2', () => {
            fixture.componentRef.setInput('iso2', 'F-R');
            expect(component.__countryClass).toBe('fi-f-r');
        });
    });
});
