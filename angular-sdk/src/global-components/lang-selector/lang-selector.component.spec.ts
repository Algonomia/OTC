import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LangSelectorComponent } from './lang-selector.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Component, Input, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-edge-popover',
    standalone: true,
    imports: [CommonModule],
    template: `
        <ng-container *ngTemplateOutlet="triggerIsOpenTpl"></ng-container>
        <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
    `
})
class MockEdgePopoverComponent {
    @Input() triggerIsOpenTpl!: TemplateRef<any>;
    @Input() contentTpl!: TemplateRef<any>;
}

@Component({
    selector: 'app-country-flag',
    standalone: true,
    template: `<span class="flag-{{iso2}}">{{display}}</span>`
})
class MockCountryFlagComponent {
    @Input() iso2!: string;
    @Input() display!: string;
}

class MockTranslateService {
    currentLang = 'en';
    defaultLang = 'en';
    onLangChange = new Subject<LangChangeEvent>();

    use(lang: string) {
        this.currentLang = lang;
        this.onLangChange.next({
            lang: lang,
            translations: {}
        });
    }
}

describe('LangSelectorComponent', () => {
    let component: LangSelectorComponent;
    let fixture: ComponentFixture<LangSelectorComponent>;
    let translateService: MockTranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LangSelectorComponent,
                MockEdgePopoverComponent,
                MockCountryFlagComponent
            ],
            providers: [
                { provide: TranslateService, useClass: MockTranslateService }
            ]
        }).overrideComponent(LangSelectorComponent, {
                set: {
                    imports: [MockEdgePopoverComponent, MockCountryFlagComponent]
                }
            }).compileComponents();

        translateService = TestBed.inject(TranslateService) as any;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LangSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with current language from TranslateService', () => {
        expect(component.__currentLang).toBe('en');
    });

    it('should initialize with default language when currentLang is not set', () => {
        translateService.currentLang = undefined as any;
        translateService.defaultLang = 'fr';

        const newFixture = TestBed.createComponent(LangSelectorComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.__currentLang).toBe('fr');
    });

    it('should fallback to "en" when both currentLang and defaultLang are not set', () => {
        translateService.currentLang = undefined as any;
        translateService.defaultLang = undefined as any;

        const newFixture = TestBed.createComponent(LangSelectorComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.__currentLang).toBe('en');
    });

    it('should display GB flag when current language is English', () => {
        component.__currentLang = 'en';
        fixture.detectChanges();

        const flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));
        const buttonFlag = flagComponents[0].componentInstance;

        expect(buttonFlag.iso2).toBe('gb');
    });

    it('should display FR flag when current language is French', () => {
        translateService.use('fr');
        fixture.detectChanges();

        const flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));
        const buttonFlag = flagComponents[0].componentInstance;

        expect(buttonFlag.iso2).toBe('fr');
    });

    it('should update current language when language changes', () => {
        expect(component.__currentLang).toBe('en');

        translateService.use('fr');
        fixture.detectChanges();

        expect(component.__currentLang).toBe('fr');
    });

    it('should call translate.use when French flag is clicked', () => {
        spyOn(translateService, 'use').and.callThrough();
        fixture.detectChanges();

        const menuItems = fixture.nativeElement.querySelectorAll('li');
        const frenchItem = menuItems[0];

        frenchItem.click();

        expect(translateService.use).toHaveBeenCalledWith('fr');
    });

    it('should call translate.use when English flag is clicked', () => {
        spyOn(translateService, 'use').and.callThrough();
        fixture.detectChanges();

        const menuItems = fixture.nativeElement.querySelectorAll('li');
        const englishItem = menuItems[1];

        englishItem.click();

        expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should update UI when switching from English to French', () => {
        component.__currentLang = 'en';
        fixture.detectChanges();

        let flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));
        expect(flagComponents[0].componentInstance.iso2).toBe('gb');

        translateService.use('fr');
        fixture.detectChanges();

        flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));
        expect(flagComponents[0].componentInstance.iso2).toBe('fr');
    });

    it('should update UI when switching from French to English', () => {
        translateService.use('fr');
        fixture.detectChanges();
        let flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));

        expect(flagComponents[0].componentInstance.iso2).toBe('fr');

        translateService.use('en');
        fixture.detectChanges();
        flagComponents = fixture.debugElement.queryAll(By.directive(MockCountryFlagComponent));

        expect(flagComponents[0].componentInstance.iso2).toBe('gb');
    });

    it('should mark component for check when language changes', () => {
        const changeDetectorRef = (component as any)._cd;
        spyOn(changeDetectorRef, 'markForCheck');
        translateService.use('fr');

        expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should render menu with two language options', () => {
        fixture.detectChanges();
        const menuItems = fixture.nativeElement.querySelectorAll('li');

        expect(menuItems.length).toBe(2);
    });

    it('should have cursor-pointer class on menu items', () => {
        fixture.detectChanges();
        const menuItems = fixture.nativeElement.querySelectorAll('li');

        menuItems.forEach((item: HTMLElement) => {
            expect(item.classList.contains('cursor-pointer')).toBe(true);
        });
    });

    it('should unsubscribe from onLangChange on component destroy', () => {
        const initialLang = component.__currentLang;
        component.ngOnDestroy();
        translateService.use('de');

        expect(component.__currentLang).toBe(initialLang);
    });
});
