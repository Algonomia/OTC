import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableUrlComponent } from './algo-table-url.component';

describe('AlgoTableUrlComponent', () => {
    let component: AlgoTableUrlComponent;
    let fixture: ComponentFixture<AlgoTableUrlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableUrlComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableUrlComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept url input', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            expect(component.url).toBe('https://example.com');
        });

        it('should have url property', () => {
            expect(component.hasOwnProperty('url')).toBe(true);
        });

        it('should have default empty url', () => {
            expect(component.url).toBe('');
        });
    });

    describe('URL rendering', () => {
        it('should render link with correct href', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toBe('https://example.com');
        });

        it('should display URL as link text', () => {
            fixture.componentRef.setInput('url', 'https://example.com/page');
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('https://example.com/page');
        });

        it('should render link when url is empty', () => {
            fixture.componentRef.setInput('url', '');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toBe('');
        });

        it('should update href when url changes', () => {
            fixture.componentRef.setInput('url', 'https://first.com');
            fixture.detectChanges();

            let link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://first.com');

            fixture.componentRef.setInput('url', 'https://second.com');
            fixture.detectChanges();

            link = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://second.com');
        });

        it('should update link text when url changes', () => {
            fixture.componentRef.setInput('url', 'https://first.com');
            fixture.detectChanges();

            let link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('https://first.com');

            fixture.componentRef.setInput('url', 'https://second.com');
            fixture.detectChanges();

            link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('https://second.com');
        });
    });

    describe('Container rendering', () => {
        it('should render container with width-100 class', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.width-100');
            expect(container).toBeTruthy();
        });

        it('should render container with text-wrap-ellipsis class', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.text-wrap-ellipsis');
            expect(container).toBeTruthy();
        });
    });

    describe('Event handling', () => {
        it('should stop event propagation on click', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('a');
            const event = new Event('click', { bubbles: true });
            spyOn(event, 'stopPropagation');

            link.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('URL formats', () => {
        it('should handle HTTP URLs', () => {
            fixture.componentRef.setInput('url', 'http://example.com');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('http://example.com');
        });

        it('should handle HTTPS URLs', () => {
            fixture.componentRef.setInput('url', 'https://secure.example.com');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://secure.example.com');
        });

        it('should handle URLs with paths', () => {
            fixture.componentRef.setInput('url', 'https://example.com/path/to/page');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://example.com/path/to/page');
        });

        it('should handle URLs with query parameters', () => {
            fixture.componentRef.setInput('url', 'https://example.com?param=value&other=123');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://example.com?param=value&other=123');
        });

        it('should handle URLs with anchors', () => {
            fixture.componentRef.setInput('url', 'https://example.com/page#section');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://example.com/page#section');
        });

        it('should handle relative URLs', () => {
            fixture.componentRef.setInput('url', '/relative/path');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('/relative/path');
        });

        it('should handle mailto links', () => {
            fixture.componentRef.setInput('url', 'mailto:test@example.com');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('mailto:test@example.com');
        });

        it('should handle tel links', () => {
            fixture.componentRef.setInput('url', 'tel:+1234567890');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('tel:+1234567890');
        });
    });

    describe('Edge cases', () => {
        it('should handle very long URLs', () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(500);
            fixture.componentRef.setInput('url', longUrl);
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe(longUrl);
        });

        it('should handle URLs with special characters', () => {
            fixture.componentRef.setInput('url', 'https://example.com/path?query=hello world&foo=bar');
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('a');
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toBe('https://example.com/path?query=hello world&foo=bar');
        });

        it('should handle URLs with encoded characters', () => {
            fixture.componentRef.setInput('url', 'https://example.com/search?q=%E6%97%A5%E6%9C%AC');
            fixture.detectChanges();

            const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
            expect(link.getAttribute('href')).toBe('https://example.com/search?q=%E6%97%A5%E6%9C%AC');
        });

        it('should handle empty string URL', () => {
            fixture.componentRef.setInput('url', '');
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('a');
            expect(link).toBeTruthy();
            expect(link.textContent?.trim()).toBe('');
        });
    });

    describe('Dynamic updates', () => {
        it('should update from empty to url', () => {
            fixture.componentRef.setInput('url', '');
            fixture.detectChanges();

            let link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('');

            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('https://example.com');
        });

        it('should update from url to empty', () => {
            fixture.componentRef.setInput('url', 'https://example.com');
            fixture.detectChanges();

            let link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('https://example.com');

            fixture.componentRef.setInput('url', '');
            fixture.detectChanges();

            link = fixture.nativeElement.querySelector('a');
            expect(link.textContent?.trim()).toBe('');
        });

        it('should handle multiple consecutive updates', () => {
            const urls = [
                'https://first.com',
                'https://second.com',
                'https://third.com'
            ];

            urls.forEach(url => {
                fixture.componentRef.setInput('url', url);
                fixture.detectChanges();

                const link = fixture.nativeElement.querySelector('a');
                expect(link.getAttribute('href')).toBe(url);
                expect(link.textContent?.trim()).toBe(url);
            });
        });
    });
});
