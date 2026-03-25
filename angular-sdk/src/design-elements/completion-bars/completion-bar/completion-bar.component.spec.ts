import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletionBarComponent } from './completion-bar.component';

describe('CompletionBarComponent', () => {
    let component: CompletionBarComponent;
    let fixture: ComponentFixture<CompletionBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CompletionBarComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompletionBarComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept completion input', () => {
            fixture.componentRef.setInput('completion', 50);
            expect(component.completion).toBe(50);
        });

        it('should have default completion of 0', () => {
            expect(component.completion).toBe(0);
        });

        it('should accept completion of 100', () => {
            fixture.componentRef.setInput('completion', 100);
            expect(component.completion).toBe(100);
        });

        it('should accept decimal completion values', () => {
            fixture.componentRef.setInput('completion', 33.33);
            expect(component.completion).toBe(33.33);
        });
    });

    describe('ngOnChanges', () => {
        it('should call markForCheck when ngOnChanges is triggered', () => {
            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            component.ngOnChanges();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });

        it('should trigger ngOnChanges when completion input changes', () => {
            spyOn(component, 'ngOnChanges');
            fixture.componentRef.setInput('completion', 75);
            fixture.detectChanges();

            expect(component.ngOnChanges).toHaveBeenCalled();
        });
    });

    describe('Template Rendering', () => {
        it('should render completion-bar container', () => {
            fixture.detectChanges();
            const container = fixture.nativeElement.querySelector('.completion-bar');
            expect(container).toBeTruthy();
        });

        it('should render completion-fill element', () => {
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill).toBeTruthy();
        });

        it('should set completion-fill width to 0% by default', () => {
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('0%');
        });

        it('should set completion-fill width to 50%', () => {
            fixture.componentRef.setInput('completion', 50);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('50%');
        });

        it('should set completion-fill width to 100%', () => {
            fixture.componentRef.setInput('completion', 100);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('100%');
        });

        it('should set completion-fill width to 75%', () => {
            fixture.componentRef.setInput('completion', 75);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('75%');
        });

        it('should handle decimal completion values in width', () => {
            fixture.componentRef.setInput('completion', 33.33);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('33.33%');
        });

        it('should update width when completion changes', () => {
            fixture.componentRef.setInput('completion', 25);
            fixture.detectChanges();
            let fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('25%');

            fixture.componentRef.setInput('completion', 80);
            fixture.detectChanges();

            fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('80%');
        });
    });

    describe('Edge Cases', () => {
        it('should handle completion values over 100', () => {
            fixture.componentRef.setInput('completion', 150);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('150%');
        });

        it('should handle very small decimal values', () => {
            fixture.componentRef.setInput('completion', 0.01);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('0.01%');
        });

        it('should handle very large values', () => {
            fixture.componentRef.setInput('completion', 999999);
            fixture.detectChanges();
            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('999999%');
        });

        it('should handle multiple rapid changes', () => {
            fixture.componentRef.setInput('completion', 10);
            fixture.detectChanges();
            fixture.componentRef.setInput('completion', 20);
            fixture.detectChanges();
            fixture.componentRef.setInput('completion', 30);
            fixture.detectChanges();

            const fill = fixture.nativeElement.querySelector('.completion-fill');
            expect(fill.style.width).toBe('30%');
        });
    });
});
