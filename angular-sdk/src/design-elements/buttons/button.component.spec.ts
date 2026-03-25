import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('defaults', () => {
        it('should have correct default values', () => {
            expect(component.btnCssClass).toBe('btn-main-3');
            expect(component.rounded).toBe(false);
            expect(component.disabled).toBe(false);
            expect(component.full_width).toBe(false);
            expect(component.label).toBe('');
        });
    });

    describe('size_theme setter', () => {
        it('should update height and font size for Large', () => {
            fixture.componentRef.setInput('size_theme', 'Large');
            expect(component.height).toBe(50);
            expect(component.font_size_rem).toBe(1.125);
        });

        it('should fallback to default size when invalid value is provided', () => {
            fixture.componentRef.setInput('size_theme', 'Invalid' as any);
            expect(component.height).toBe(32);
            expect(component.font_size_rem).toBe(0.875);
        });

        it('should call markForCheck', () => {
            const cdSpy = spyOn(component.cd, 'markForCheck');
            fixture.componentRef.setInput('size_theme', 'Large');
            expect(cdSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should initialize algoIconHandler and height px', () => {
            component.height = 40;
            component.ngOnInit();

            expect(component.algoIconHandler).toBeDefined();
            expect(component.__height_px).toBe('40px');
        });

        it('should call markForCheck', () => {
            const cdSpy = spyOn(component.cd, 'markForCheck');
            component.ngOnInit();
            expect(cdSpy).toHaveBeenCalled();
        });
    });

    describe('template rendering', () => {
        it('should render button with default class', () => {
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('button');
            expect(button).toBeTruthy();
            expect(button.classList.contains('btn-main-3')).toBe(true);
        });

        it('should apply custom btnCssClass', () => {
            fixture.componentRef.setInput('btnCssClass', 'btn-ok-4');
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('button');
            expect(button.classList.contains('btn-ok-4')).toBe(true);
        });

        it('should apply rounded and full-width classes', () => {
            fixture.componentRef.setInput('rounded', true);
            fixture.componentRef.setInput('full_width', true);
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('button');
            expect(button.classList.contains('rounded')).toBe(true);
            expect(button.classList.contains('full-width')).toBe(true);
        });

        it('should disable button when disabled is true', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('button');
            expect(button.disabled).toBe(true);
        });
    });

    describe('content rendering', () => {
        it('should render text and icons together', () => {
            fixture.componentRef.setInput('leftIcon', 'Action/Arrow/ArrowLeft');
            fixture.componentRef.setInput('text', 'text');
            fixture.componentRef.setInput('rightIcon', 'Action/Arrow/ArrowRight');
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.icon-left')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.text')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.icon-right')).toBeTruthy();
        });

        it('should apply text color when provided', () => {
            fixture.componentRef.setInput('text', 'Colored text');
            fixture.componentRef.setInput('textColor', 'var(--main-2)');
            fixture.detectChanges();

            const span = fixture.nativeElement.querySelector('.text');
            expect(span.style.color).toBe('var(--main-2)');
        });

        it('should render singleIcon when provided', () => {
            fixture.componentRef.setInput('singleIcon', 'Action/Arrow/ArrowRight');
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.icon-single')).toBeTruthy();
        });
    });
});
