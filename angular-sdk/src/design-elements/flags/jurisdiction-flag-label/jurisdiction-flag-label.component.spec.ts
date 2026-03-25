import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JurisdictionFlagLabelComponent } from './jurisdiction-flag-label.component';
import { CountriesService } from '../../../global-services/countries.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('JurisdictionFlagLabelComponent', () => {
    let component: JurisdictionFlagLabelComponent;
    let fixture: ComponentFixture<JurisdictionFlagLabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JurisdictionFlagLabelComponent, TranslateModule.forRoot()],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JurisdictionFlagLabelComponent);
        component = fixture.componentInstance;
        TestBed.inject(TranslateService).use('en');
        spyOn(CountriesService, 'getName').and.returnValue('France');
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Input Bindings', () => {
        it('should accept iso2 input', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['__iso2']).toBe('FR');
        });

        it('should set __title when iso2 is set', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['__title']).toBe('France');
        });

        it('should call CountriesService.getName when iso2 is set', () => {
            fixture.componentRef.setInput('iso2', 'DE');
            expect(CountriesService.getName).toHaveBeenCalledWith('DE', jasmine.anything());
        });
    });

    describe('iso2 setter', () => {
        it('should set __iso2 property', () => {
            fixture.componentRef.setInput('iso2', 'IT');
            expect(component['__iso2']).toBe('IT');
        });

        it('should update __title with country name', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('Germany');
            fixture.componentRef.setInput('iso2', 'DE');
            expect(component['__title']).toBe('Germany');
        });

        it('should update __title when iso2 changes', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValues('France', 'Spain');

            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['__title']).toBe('France');

            fixture.componentRef.setInput('iso2', 'ES');
            expect(component['__title']).toBe('Spain');
        });

        it('should call CountriesService.getName each time iso2 changes', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.componentRef.setInput('iso2', 'DE');
            fixture.componentRef.setInput('iso2', 'IT');

            expect(CountriesService.getName).toHaveBeenCalledTimes(3);
            expect(CountriesService.getName).toHaveBeenCalledWith('FR', jasmine.anything());
            expect(CountriesService.getName).toHaveBeenCalledWith('DE', jasmine.anything());
            expect(CountriesService.getName).toHaveBeenCalledWith('IT', jasmine.anything());
        });
    });

    describe('Template Rendering', () => {
        it('should render country flag when iso2 is set', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.detectChanges();

            const countryFlag = fixture.nativeElement.querySelector('app-country-flag');
            expect(countryFlag).toBeTruthy();
        });

        it('should not render country flag when iso2 is not set', () => {
            fixture.detectChanges();

            const countryFlag = fixture.nativeElement.querySelector('app-country-flag');
            expect(countryFlag).toBeFalsy();
        });

        it('should render label-info component', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.detectChanges();

            const labelInfo = fixture.nativeElement.querySelector('app-label-info');
            expect(labelInfo).toBeTruthy();
        });

        it('should display country title', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('France');
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.detectChanges();

            const titleElement = fixture.nativeElement.querySelector('.jurisdiction');
            expect(titleElement).toBeTruthy();
            expect(titleElement.textContent.trim()).toBe('France');
        });

        it('should update displayed title when iso2 changes', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('France');
            fixture.componentRef.setInput('iso2', 'FR');
            fixture.detectChanges();

            let titleElement = fixture.nativeElement.querySelector('.jurisdiction');
            expect(titleElement.textContent.trim()).toBe('France');

            (CountriesService.getName as jasmine.Spy).and.returnValue('Germany');
            fixture.componentRef.setInput('iso2', 'DE');
            fixture.detectChanges();

            titleElement = fixture.nativeElement.querySelector('.jurisdiction');
            expect(titleElement.textContent.trim()).toBe('Germany');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string iso2', () => {
            fixture.componentRef.setInput('iso2', '');
            expect(component['__iso2']).toBe('');
            expect(CountriesService.getName).toHaveBeenCalledWith('', jasmine.anything());
        });

        it('should handle uppercase iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['__iso2']).toBe('FR');
        });

        it('should handle lowercase iso2 codes', () => {
            fixture.componentRef.setInput('iso2', 'fr');
            expect(component['__iso2']).toBe('fr');
        });

        it('should handle invalid iso2 codes', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('');
            fixture.componentRef.setInput('iso2', 'XX');

            expect(component['__iso2']).toBe('XX');
            expect(component['__title']).toBe('');
        });

        it('should handle multiple consecutive iso2 changes', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValues('France', 'Germany', 'Italy', 'Spain');

            fixture.componentRef.setInput('iso2', 'FR');
            expect(component['__title']).toBe('France');

            fixture.componentRef.setInput('iso2', 'DE');
            expect(component['__title']).toBe('Germany');

            fixture.componentRef.setInput('iso2', 'IT');
            expect(component['__title']).toBe('Italy');

            fixture.componentRef.setInput('iso2', 'ES');
            expect(component['__title']).toBe('Spain');
        });

        it('should handle same iso2 value correctly', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue('France');

            fixture.componentRef.setInput('iso2', 'FR');

            expect(component['__iso2']).toBe('FR');
            expect(component['__title']).toBe('France');
        });

        it('should handle null or undefined returned by getName', () => {
            (CountriesService.getName as jasmine.Spy).and.returnValue(null);
            fixture.componentRef.setInput('iso2', 'XX');

            expect(component['__title']).toBeNull();
        });

        it('should render without iso2 initially', () => {
            fixture.detectChanges();

            const countryFlag = fixture.nativeElement.querySelector('app-country-flag');
            expect(countryFlag).toBeFalsy();
        });

        it('should handle special characters in iso2', () => {
            fixture.componentRef.setInput('iso2', 'F-R');
            expect(component['__iso2']).toBe('F-R');
            expect(CountriesService.getName).toHaveBeenCalledWith('F-R', jasmine.anything());
        });

        it('should handle numeric iso2', () => {
            fixture.componentRef.setInput('iso2', '12');
            expect(component['__iso2']).toBe('12');
        });
    });
});
