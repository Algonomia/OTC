import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableProposedByComponent } from './algo-table-proposed-by.component';

describe('AlgoTableProposedByComponent', () => {
    let component: AlgoTableProposedByComponent;
    let fixture: ComponentFixture<AlgoTableProposedByComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableProposedByComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableProposedByComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept text input', () => {
            fixture.componentRef.setInput('text', 'John Doe');
            expect(component.text).toBe('John Doe');
        });

        it('should have text property', () => {
            expect(component.hasOwnProperty('text')).toBe(true);
        });
    });

    describe('Template Rendering', () => {
        describe('conditional rendering', () => {
            it('should render text div when text is provided', () => {
                fixture.componentRef.setInput('text', 'Proposed by John');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();
            });

            it('should not render text div when text is empty string', () => {
                fixture.componentRef.setInput('text', '');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();
            });

            it('should not render text div when text is null', () => {
                fixture.componentRef.setInput('text', null as any);
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();
            });

            it('should not render text div when text is undefined', () => {
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();
            });
        });

        describe('text content', () => {
            it('should display the provided text', () => {
                fixture.componentRef.setInput('text', 'Proposed by John Doe');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('Proposed by John Doe');
            });

            it('should display text with special characters', () => {
                fixture.componentRef.setInput('text', 'User "John" & <Team>');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('User "John" & <Team>');
            });

            it('should display very long text', () => {
                const longText = 'This is a very long name for a person who proposed something. '.repeat(5);
                fixture.componentRef.setInput('text', longText);
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe(longText.trim());
            });

            it('should display text with numbers', () => {
                fixture.componentRef.setInput('text', 'User 123 - Department 456');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('User 123 - Department 456');
            });

            it('should display text with emojis', () => {
                fixture.componentRef.setInput('text', 'John Doe 👤');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('John Doe 👤');
            });

            it('should display single character text', () => {
                fixture.componentRef.setInput('text', 'A');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('A');
            });
        });

        describe('dynamic updates', () => {
            it('should update text content when text input changes', () => {
                fixture.componentRef.setInput('text', 'John Doe');
                fixture.detectChanges();

                let textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('John Doe');

                fixture.componentRef.setInput('text', 'Jane Smith');
                fixture.detectChanges();

                textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('Jane Smith');
            });

            it('should remove text div when text becomes empty', () => {
                fixture.componentRef.setInput('text', 'John Doe');
                fixture.detectChanges();

                let textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();

                fixture.componentRef.setInput('text', '');
                fixture.detectChanges();

                textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();
            });

            it('should show text div when text changes from empty to non-empty', () => {
                fixture.componentRef.setInput('text', '');
                fixture.detectChanges();

                let textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();

                fixture.componentRef.setInput('text', 'John Doe');
                fixture.detectChanges();

                textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();
                expect(textDiv.textContent.trim()).toBe('John Doe');
            });

            it('should remove text div when text becomes null', () => {
                fixture.componentRef.setInput('text', 'John Doe');
                fixture.detectChanges();

                let textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();

                fixture.componentRef.setInput('text', null as any);
                fixture.detectChanges();

                textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeFalsy();
            });
        });

        describe('edge cases', () => {
            it('should handle text with only spaces', () => {
                fixture.componentRef.setInput('text', '     ');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();
                expect(textDiv.textContent.trim()).toBe('');
            });

            it('should handle text with tabs', () => {
                fixture.componentRef.setInput('text', '\t\tTabbed text\t\t');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();
                expect(textDiv.textContent).toContain('Tabbed text');
            });

            it('should handle text with multiple consecutive spaces', () => {
                fixture.componentRef.setInput('text', 'John    Doe');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv).toBeTruthy();
                expect(textDiv.textContent).toContain('John');
                expect(textDiv.textContent).toContain('Doe');
            });

            it('should handle HTML-like text without rendering it', () => {
                fixture.componentRef.setInput('text', '<div>Not HTML</div>');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('<div>Not HTML</div>');
                expect(textDiv.querySelector('div')).toBeFalsy();
            });

            it('should handle text with email addresses', () => {
                fixture.componentRef.setInput('text', 'john.doe@example.com');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('john.doe@example.com');
            });

            it('should handle text with special punctuation', () => {
                fixture.componentRef.setInput('text', 'User (Admin) - [Team Lead]');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('User (Admin) - [Team Lead]');
            });

            it('should handle multilingual text', () => {
                fixture.componentRef.setInput('text', 'Jean-François Müller 中文');
                fixture.detectChanges();

                const textDiv = fixture.nativeElement.querySelector('.text');
                expect(textDiv.textContent.trim()).toBe('Jean-François Müller 中文');
            });
        });
    });
});
