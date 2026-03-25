import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableArrayTextComponent } from './algo-table-array-text.component';

describe('AlgoTableArrayTextComponent', () => {
    let component: AlgoTableArrayTextComponent;
    let fixture: ComponentFixture<AlgoTableArrayTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableArrayTextComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableArrayTextComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept texts input', () => {
            const texts = ['Text 1', 'Text 2', 'Text 3'];
            fixture.componentRef.setInput('texts', texts);
            expect(component.texts).toEqual(texts);
        });

        it('should accept empty array', () => {
            fixture.componentRef.setInput('texts', []);
            expect(component.texts).toEqual([]);
        });

        it('should accept single text', () => {
            const texts = ['Single text'];
            fixture.componentRef.setInput('texts', texts);
            expect(component.texts).toEqual(texts);
        });
    });

    describe('Template Rendering', () => {
        describe('text items', () => {
            it('should render correct number of text items', () => {
                fixture.componentRef.setInput('texts', ['Text 1', 'Text 2', 'Text 3']);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(3);
            });

            it('should render single text item', () => {
                fixture.componentRef.setInput('texts', ['Single text']);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(1);
            });

            it('should not render any items when texts is empty', () => {
                fixture.componentRef.setInput('texts', []);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(0);
            });

            it('should have comment class on each item', () => {
                fixture.componentRef.setInput('texts', ['Text 1', 'Text 2']);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                items.forEach((item: Element) => {
                    expect(item.classList.contains('comment')).toBe(true);
                });
            });

            it('should display correct text content', () => {
                const texts = ['First text', 'Second text', 'Third text'];
                fixture.componentRef.setInput('texts', texts);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                items.forEach((item: Element, index: number) => {
                    expect(item.textContent?.trim()).toBe(texts[index]);
                });
            });

            it('should display text with special characters', () => {
                const texts = ['Text with "quotes"', 'Text with <html>', 'Text with & symbol'];
                fixture.componentRef.setInput('texts', texts);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items[0].textContent?.trim()).toBe('Text with "quotes"');
                expect(items[1].textContent?.trim()).toBe('Text with <html>');
                expect(items[2].textContent?.trim()).toBe('Text with & symbol');
            });

            it('should display empty string', () => {
                fixture.componentRef.setInput('texts', ['', 'Valid text', '']);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(3);
                expect(items[0].textContent?.trim()).toBe('');
                expect(items[1].textContent?.trim()).toBe('Valid text');
                expect(items[2].textContent?.trim()).toBe('');
            });

            it('should display long text', () => {
                const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
                fixture.componentRef.setInput('texts', [longText]);
                fixture.detectChanges();

                const item = fixture.nativeElement.querySelector('.comment');
                expect(item.textContent?.trim()).toBe(longText.trim());
            });
        });

        describe('dynamic updates', () => {
            it('should update when texts array changes', () => {
                fixture.componentRef.setInput('texts', ['Initial 1', 'Initial 2']);
                fixture.detectChanges();

                let items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(2);

                fixture.componentRef.setInput('texts', ['Updated 1', 'Updated 2', 'Updated 3']);
                fixture.detectChanges();

                items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(3);
                expect(items[0].textContent?.trim()).toBe('Updated 1');
                expect(items[1].textContent?.trim()).toBe('Updated 2');
                expect(items[2].textContent?.trim()).toBe('Updated 3');
            });

            it('should clear items when texts becomes empty', () => {
                fixture.componentRef.setInput('texts', ['Text 1', 'Text 2']);
                fixture.detectChanges();

                let items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(2);

                fixture.componentRef.setInput('texts', []);
                fixture.detectChanges();

                items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(0);
            });

            it('should add items when texts grows', () => {
                fixture.componentRef.setInput('texts', ['Text 1']);
                fixture.detectChanges();

                let items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(1);

                fixture.componentRef.setInput('texts', ['Text 1', 'Text 2', 'Text 3', 'Text 4']);
                fixture.detectChanges();

                items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(4);
            });
        });

        describe('edge cases', () => {
            it('should handle array with many items', () => {
                const manyTexts = Array.from({ length: 100 }, (_, i) => `Text ${i + 1}`);
                fixture.componentRef.setInput('texts', manyTexts);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(100);
            });

            it('should handle array with duplicate texts', () => {
                const texts = ['Same text', 'Same text', 'Same text'];
                fixture.componentRef.setInput('texts', texts);
                fixture.detectChanges();

                const items = fixture.nativeElement.querySelectorAll('.comment');
                expect(items.length).toBe(3);
                items.forEach((item: Element) => {
                    expect(item.textContent?.trim()).toBe('Same text');
                });
            });
        });
    });
});
