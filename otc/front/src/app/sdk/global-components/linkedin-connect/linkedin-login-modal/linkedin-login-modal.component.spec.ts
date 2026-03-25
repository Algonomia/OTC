import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedinLoginModalComponent } from './linkedin-login-modal.component';
import { AuthLinkedinService } from '../../../global-services/auth.linkedin.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Component, Input, TemplateRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-algo-icon',
    standalone: true,
    template: `<span class="icon-{{name}}"></span>`
})
class MockAlgoIconComponent {
    @Input() name!: string;
}

@Component({
    selector: 'app-button-continue',
    standalone: true,
    template: `<button>{{text}}</button>`
})
class MockButtonContinueComponent {
    @Input() text!: string;
    @Input() size_theme!: string;
}

@Component({
    selector: 'app-href-handler',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `<ng-container *ngTemplateOutlet="template"></ng-container>`
})
class MockHrefHandlerComponent {
    @Input() link!: string;
    @Input() template!: TemplateRef<any>;
}

class MockAuthLinkedinService {
    connect() {}
}

describe('LinkedinLoginModalComponent', () => {
    let component: LinkedinLoginModalComponent;
    let fixture: ComponentFixture<LinkedinLoginModalComponent>;
    let authLinkedinService: MockAuthLinkedinService;
    let dynamicDialogConfig: DynamicDialogConfig;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LinkedinLoginModalComponent,
                MockAlgoIconComponent,
                MockButtonContinueComponent,
                MockHrefHandlerComponent,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: AuthLinkedinService, useClass: MockAuthLinkedinService },
                {
                    provide: DynamicDialogConfig,
                    useValue: {
                        data: {
                            inputs: 'test-input'
                        }
                    }
                }
            ]
        }).overrideComponent(LinkedinLoginModalComponent, {
            set: {
                imports: [
                    MockAlgoIconComponent,
                    MockButtonContinueComponent,
                    MockHrefHandlerComponent,
                    TranslateModule
                ]
            }
        }).compileComponents();

        authLinkedinService = TestBed.inject(AuthLinkedinService) as any;
        dynamicDialogConfig = TestBed.inject(DynamicDialogConfig);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LinkedinLoginModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize inputs from config data', () => {
        expect(component.inputs).toBe('test-input');
    });

    it('should display LinkedIn icon', () => {
        const icon = fixture.debugElement.query(By.directive(MockAlgoIconComponent));
        expect(icon).toBeTruthy();
        expect(icon.componentInstance.name).toBe('Brand/Mark/LinkedinConnect');
    });

    it('should display sign in text', () => {
        const text = fixture.nativeElement.querySelector('.connection-button-text');
        expect(text).toBeTruthy();
        expect(text.textContent.trim()).toBe('OTCFront.Login.SignInLinkedin');
    });

    it('should display continue button with correct text', () => {
        const button = fixture.debugElement.query(By.directive(MockButtonContinueComponent));
        expect(button).toBeTruthy();
        expect(button.componentInstance.text).toBe('Log-in now');
        expect(button.componentInstance.size_theme).toBe('Large');
    });

    it('should call login when continue button is clicked', () => {
        spyOn(component, 'login');
        const buttonContainer = fixture.nativeElement.querySelector('app-button-continue');
        buttonContainer.click();
        fixture.detectChanges();
        expect(component.login).toHaveBeenCalled();
    });

    it('should call authLinkedin.connect when login is called', () => {
        spyOn(authLinkedinService, 'connect');
        component.login();
        expect(authLinkedinService.connect).toHaveBeenCalled();
    });

    it('should display privacy policy link', () => {
        const privacyPolicyText = Array.from(fixture.nativeElement.querySelectorAll('.link'))
            .find((el: any) => el.textContent.trim() === 'OTCFront.Login.PrivacyPolicy');

        expect(privacyPolicyText).toBeTruthy();
    });

    it('should display terms of service link', () => {
        const termsOfServiceText = Array.from(fixture.nativeElement.querySelectorAll('.link'))
            .find((el: any) => el.textContent.trim() === 'OTCFront.Login.TermsOfService');

        expect(termsOfServiceText).toBeTruthy();
    });

    it('should have two HrefHandler components for links', () => {
        const hrefHandlers = fixture.debugElement.queryAll(By.directive(MockHrefHandlerComponent));
        expect(hrefHandlers.length).toBe(2);
    });

    it('should have correct layout structure', () => {
        const topSection = fixture.nativeElement.querySelector('.std-aligned.pad-1.gap-1');
        const middleSection = fixture.nativeElement.querySelector('.flex.flex-column.pad-1.gap-1');
        const bottomSection = fixture.nativeElement.querySelector('p.pad-1');

        expect(topSection).toBeTruthy();
        expect(middleSection).toBeTruthy();
        expect(bottomSection).toBeTruthy();
    });

    it('should handle undefined or missing config data gracefully', async () => {
        await TestBed.resetTestingModule();
        const emptyConfig = { data: undefined } as DynamicDialogConfig;

        await TestBed.configureTestingModule({
            imports: [
                LinkedinLoginModalComponent,
                MockAlgoIconComponent,
                MockButtonContinueComponent,
                MockHrefHandlerComponent,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: AuthLinkedinService, useClass: MockAuthLinkedinService },
                { provide: DynamicDialogConfig, useValue: emptyConfig }
            ]
        }).overrideComponent(LinkedinLoginModalComponent, {
            set: {
                imports: [
                    MockAlgoIconComponent,
                    MockButtonContinueComponent,
                    MockHrefHandlerComponent,
                    TranslateModule
                ]
            }
        }).compileComponents();

        const newFixture = TestBed.createComponent(LinkedinLoginModalComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.inputs).toBeUndefined();
    });

    it('should have icon with correct class', () => {
        const icon = fixture.nativeElement.querySelector('.icon-linkedin');
        expect(icon).toBeTruthy();
    });
});
