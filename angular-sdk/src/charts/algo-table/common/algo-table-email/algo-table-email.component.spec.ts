import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableEmailComponent } from './algo-table-email.component';

describe('AlgoTableEmailComponent', () => {
    let component: AlgoTableEmailComponent;
    let fixture: ComponentFixture<AlgoTableEmailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableEmailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableEmailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Text rendering', () => {
        it('should render text when provided', () => {
            fixture.componentRef.setInput('text', 'test@example.com');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();
            expect(textElement.textContent.trim()).toBe('test@example.com');
        });

        it('should not render div when text is empty string', () => {
            fixture.componentRef.setInput('text', '');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();
        });

        it('should not render div when text is undefined', () => {
            fixture.componentRef.setInput('text', undefined as any);
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();
        });

        it('should not render div when text is null', () => {
            fixture.componentRef.setInput('text', null as any);
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();
        });

        it('should update text when changed', () => {
            fixture.componentRef.setInput('text', 'initial@example.com');
            fixture.detectChanges();

            let textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('initial@example.com');

            fixture.componentRef.setInput('text', 'updated@example.com');
            fixture.detectChanges();

            textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('updated@example.com');
        });

        it('should handle email with special characters', () => {
            fixture.componentRef.setInput('text', 'user+test@example.co.uk');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('user+test@example.co.uk');
        });

        it('should handle very long email addresses', () => {
            const longEmail = 'very.long.email.address.with.many.dots@subdomain.example.com';
            fixture.componentRef.setInput('text', longEmail);
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe(longEmail);
        });

        it('should handle non-email text', () => {
            fixture.componentRef.setInput('text', 'Not an email');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('Not an email');
        });

        it('should handle text with whitespace', () => {
            fixture.componentRef.setInput('text', '  email@example.com  ');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('email@example.com');
        });

        it('should render text with unicode characters', () => {
            fixture.componentRef.setInput('text', 'user@例え.jp');
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement.textContent.trim()).toBe('user@例え.jp');
        });
    });

    describe('Conditional rendering', () => {
        it('should toggle rendering based on text presence', () => {
            fixture.componentRef.setInput('text', 'test@example.com');
            fixture.detectChanges();

            let textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();

            fixture.componentRef.setInput('text', '');
            fixture.detectChanges();

            textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();

            fixture.componentRef.setInput('text', 'another@example.com');
            fixture.detectChanges();

            textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();
        });

        it('should handle switching from undefined to defined', () => {
            fixture.componentRef.setInput('text', undefined as any);
            fixture.detectChanges();

            let textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();

            fixture.componentRef.setInput('text', 'new@example.com');
            fixture.detectChanges();

            textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeTruthy();
            expect(textElement.textContent.trim()).toBe('new@example.com');
        });
    });

    describe('Component initialization', () => {
        it('should not render anything initially without input', () => {
            fixture.detectChanges();

            const textElement = fixture.nativeElement.querySelector('.text');
            expect(textElement).toBeFalsy();
        });

        it('should have text input property', () => {
            expect(component.hasOwnProperty('text')).toBe(true);
        });
    });

    it('should handle text with HTML characters', () => {
        fixture.componentRef.setInput('text', 'user<script>@example.com');
        fixture.detectChanges();

        const textElement = fixture.nativeElement.querySelector('.text');
        expect(textElement.textContent.trim()).toBe('user<script>@example.com');
    });
});
