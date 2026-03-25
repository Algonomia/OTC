import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';
import { HrefHandlerComponent } from '../../plugs/href-handler/href-handler.component';
import { DebugElement, Component, Input, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

@Component({
    selector: 'app-screen-size-handler',
    standalone: true,
    imports: [CommonModule],
    template: `
        <ng-container *ngTemplateOutlet="activeTemplate"></ng-container>
    `
})
class MockScreenSizeHandlerComponent {
    @Input() appSmallTemplate!: TemplateRef<any>;
    @Input() appIntermediaryTemplate!: TemplateRef<any>;
    @Input() appNormalTemplate!: TemplateRef<any>;

    activeTemplate!: TemplateRef<any>;
    screenSize: 'small' | 'intermediary' | 'normal' = 'normal';

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        switch(this.screenSize) {
            case 'small':
                this.activeTemplate = this.appSmallTemplate;
                break;
            case 'intermediary':
                this.activeTemplate = this.appIntermediaryTemplate;
                break;
            case 'normal':
            default:
                this.activeTemplate = this.appNormalTemplate;
                break;
        }
    }

    setSmallScreen() {
        this.screenSize = 'small';
        this.activeTemplate = this.appSmallTemplate;
        this.cdr.detectChanges();
    }

    setIntermediaryScreen() {
        this.screenSize = 'intermediary';
        this.activeTemplate = this.appIntermediaryTemplate;
        this.cdr.detectChanges();
    }

    setNormalScreen() {
        this.screenSize = 'normal';
        this.activeTemplate = this.appNormalTemplate;
        this.cdr.detectChanges();
    }
}

describe('LogoComponent', () => {
    let component: LogoComponent;
    let fixture: ComponentFixture<LogoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HrefHandlerComponent, MockScreenSizeHandlerComponent
            ],
            providers: [
                { provide: ActivatedRoute, useValue: {} }
            ]
        }).overrideComponent(LogoComponent, {
                set: {
                    imports: [CommonModule, MockScreenSizeHandlerComponent, HrefHandlerComponent]
                }
            }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoComponent);
        component = fixture.componentInstance;

        component.logo_light = 'assets/logo/Logo/Logo Light.svg';
        component.logo_regular = 'assets/logo/Logo/Logo Regular.svg';
        component.logo_medium = 'assets/logo/Logo/Logo Medium.svg';
        component.wordmark_light = 'assets/logo/Wordmark/Wordmark Light.svg';
        component.wordmark_regular = 'assets/logo/Wordmark/Wordmark Regular.svg';
        component.wordmark_medium = 'assets/logo/Wordmark/Wordmark Medium.svg';
        component.short_wordmark_light = 'assets/logo/Short wordmark/Short wordmark Light.svg';
        component.short_wordmark_regular = 'assets/logo/Short wordmark/Short wordmark Regular.svg';
        component.short_wordmark_medium = 'assets/logo/Short wordmark/Short wordmark Medium.svg';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    function getScreenSizeHandler(): MockScreenSizeHandlerComponent | null {
        const debugElement = fixture.debugElement.query(By.directive(MockScreenSizeHandlerComponent));
        return debugElement ? debugElement.componentInstance : null;
    }

    it('should initialize logo_paths correctly', () => {
        fixture.detectChanges();

        expect(component.logo_paths).toEqual({
            logo: {
                Light: 'assets/logo/Logo/Logo Light.svg',
                Regular: 'assets/logo/Logo/Logo Regular.svg',
                Medium: 'assets/logo/Logo/Logo Medium.svg',
            },
            wordmark: {
                Light: 'assets/logo/Wordmark/Wordmark Light.svg',
                Regular: 'assets/logo/Wordmark/Wordmark Regular.svg',
                Medium: 'assets/logo/Wordmark/Wordmark Medium.svg',
            },
            short_wordmark: {
                Light: 'assets/logo/Short wordmark/Short wordmark Light.svg',
                Regular: 'assets/logo/Short wordmark/Short wordmark Regular.svg',
                Medium: 'assets/logo/Short wordmark/Short wordmark Medium.svg',
            }
        });
    });

    it('should change weight on mouseenter and mouseleave', () => {
        fixture.detectChanges();

        const div: HTMLElement = fixture.nativeElement.querySelector('.std-aligned');

        expect(component.weight).toBe('Medium');

        div.dispatchEvent(new Event('mouseenter'));
        fixture.detectChanges();
        expect(component.weight).toBe('Regular');

        div.dispatchEvent(new Event('mouseleave'));
        fixture.detectChanges();
        expect(component.weight).toBe('Medium');
    });

    it('should render short_wordmark for small screen', () => {
        fixture.detectChanges();

        const mockScreenSizeHandler = getScreenSizeHandler();
        expect(mockScreenSizeHandler).toBeTruthy();

        mockScreenSizeHandler!.setSmallScreen();
        fixture.detectChanges();

        const images = fixture.nativeElement.querySelectorAll('img');
        const wordmarkImg = Array.from(images).find(
            (img: any) => img.alt === 'logo_text'
        ) as HTMLImageElement;

        expect(wordmarkImg).toBeTruthy();
        expect(wordmarkImg.src).toContain('Short%20wordmark');
        expect(wordmarkImg.src).toContain('Medium.svg');
    });

    it('should render short_wordmark for intermediary screen', () => {
        fixture.detectChanges();

        const mockScreenSizeHandler = getScreenSizeHandler();
        expect(mockScreenSizeHandler).toBeTruthy();

        mockScreenSizeHandler!.setIntermediaryScreen();
        fixture.detectChanges();

        const images = fixture.nativeElement.querySelectorAll('img');
        const wordmarkImg = Array.from(images).find(
            (img: any) => img.alt === 'logo_text'
        ) as HTMLImageElement;

        expect(wordmarkImg).toBeTruthy();
        expect(wordmarkImg.src).toContain('Short%20wordmark');
        expect(wordmarkImg.src).toContain('Medium.svg');
    });

    it('should render wordmark for normal screen', () => {
        fixture.detectChanges();

        const mockScreenSizeHandler = getScreenSizeHandler();
        expect(mockScreenSizeHandler).toBeTruthy();

        mockScreenSizeHandler!.setNormalScreen();
        fixture.detectChanges();

        const images = fixture.nativeElement.querySelectorAll('img');
        const wordmarkImg = Array.from(images).find(
            (img: any) => img.alt === 'logo_text'
        ) as HTMLImageElement;

        expect(wordmarkImg).toBeTruthy();
        expect(wordmarkImg.src).toContain('Wordmark');
        expect(wordmarkImg.src).not.toContain('Short%20wordmark');
        expect(wordmarkImg.src).toContain('Medium.svg');
    });
});
