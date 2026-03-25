import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgoTableLinkIconComponent } from './algo-table-link-icon.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AlgoTableLinkIconComponent', () => {
    let component: AlgoTableLinkIconComponent;
    let fixture: ComponentFixture<AlgoTableLinkIconComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableLinkIconComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlgoTableLinkIconComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize algoIconHandler with weightIcon', () => {
            component.weightIcon = 'Regular';
            component.ngOnInit();

            expect(component.algoIconHandler).toBeDefined();
            expect(component.algoIconHandler.activeWeight).toBe('Regular');
        });
    });

    describe('Conditional Rendering', () => {
        it('should not render when text is not provided', () => {
            fixture.componentRef.setInput('link', 'https://example.com');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeFalsy();
        });

        it('should not render when link is not provided', () => {
            fixture.componentRef.setInput('text', 'Click here');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeFalsy();
        });

        it('should render when both text and link are provided', () => {
            fixture.componentRef.setInput('text', 'Click here');
            fixture.componentRef.setInput('link', 'https://example.com');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeTruthy();
        });

        it('should not render when text is empty string', () => {
            fixture.componentRef.setInput('text', '');
            fixture.componentRef.setInput('link', 'https://example.com');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeFalsy();
        });

        it('should not render when link is empty string', () => {
            fixture.componentRef.setInput('text', 'Click here');
            fixture.componentRef.setInput('link', '');
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.flex');
            expect(container).toBeFalsy();
        });
    });

    describe('Event Handling', () => {
        it('should stop event propagation on click', () => {
            fixture.componentRef.setInput('text', 'Click here');
            fixture.componentRef.setInput('link', 'https://example.com');
            fixture.detectChanges();

            const anchor = fixture.nativeElement.querySelector('a');
            const event = new Event('click', { bubbles: true, cancelable: true });
            spyOn(event, 'stopPropagation');

            anchor.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('Optional Icon Rendering', () => {
        beforeEach(() => {
            fixture.componentRef.setInput('text', 'Click here');
            fixture.componentRef.setInput('link', 'https://example.com');
        });

        it('should render only external link icon when optional icon is not provided', () => {
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(1);
        });

        it('should render both icons when optional icon is provided', () => {
            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(2);
        });

        it('should add optional icon when icon changes from empty to value', () => {
            fixture.detectChanges();

            let icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(1);

            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.detectChanges();

            icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(2);
        });

        it('should remove optional icon when icon becomes empty', () => {
            fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
            fixture.detectChanges();

            let icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(2);

            fixture.componentRef.setInput('icon', '');
            fixture.detectChanges();

            icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(1);
        });

        it('should not render optional icon when icon is empty string', () => {
            fixture.componentRef.setInput('icon', '');
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('app-algo-icon');
            expect(icons.length).toBe(1);
        });
    });
});
