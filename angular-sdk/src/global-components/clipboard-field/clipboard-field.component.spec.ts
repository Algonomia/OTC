import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClipboardFieldComponent } from './clipboard-field.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ClipboardFieldComponent', () => {
    let component: ClipboardFieldComponent;
    let fixture: ComponentFixture<ClipboardFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClipboardFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardFieldComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Conditional Rendering', () => {
        it('should render label when label is provided', () => {
            fixture.componentRef.setInput('label', 'My Label');
            fixture.detectChanges();

            const labelElement = fixture.nativeElement.querySelector('.label-text');
            expect(labelElement).toBeTruthy();
        });

        it('should not render label when label is not provided', () => {
            fixture.detectChanges();

            const labelElement = fixture.nativeElement.querySelector('.label-text');
            expect(labelElement).toBeNull();
        });

        it('should not render label when label is empty string', () => {
            fixture.componentRef.setInput('label', '');
            fixture.detectChanges();

            const labelElement = fixture.nativeElement.querySelector('.label-text');
            expect(labelElement).toBeNull();
        });

        it('should render text field when text is provided', () => {
            fixture.componentRef.setInput('text', 'Sample text');
            fixture.detectChanges();

            const textField = fixture.nativeElement.querySelector('.clipboard-field');
            expect(textField).toBeTruthy();
        });

        it('should not render text field when text is not provided', () => {
            fixture.detectChanges();

            const textField = fixture.nativeElement.querySelector('.clipboard-field');
            expect(textField).toBeNull();
        });

        it('should not render text field when text is empty string', () => {
            fixture.componentRef.setInput('text', '');
            fixture.detectChanges();

            const textField = fixture.nativeElement.querySelector('.clipboard-field');
            expect(textField).toBeNull();
        });
    });

    describe('clipboard method', () => {
        let clipboardSpy: jasmine.Spy;
        let notifBroadcasterSpy: jasmine.Spy;

        beforeEach(() => {
            clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
            notifBroadcasterSpy = spyOn(component['_simpleNotifBroadcaster'], 'send');
        });

        it('should return early when text is not provided', () => {
            component.clipboard();

            expect(clipboardSpy).not.toHaveBeenCalled();
            expect(notifBroadcasterSpy).not.toHaveBeenCalled();
        });

        it('should return early when text is empty string', () => {
            fixture.componentRef.setInput('text', '');
            component.clipboard();

            expect(clipboardSpy).not.toHaveBeenCalled();
            expect(notifBroadcasterSpy).not.toHaveBeenCalled();
        });

        it('should call navigator.clipboard.writeText with text', () => {
            fixture.componentRef.setInput('text', 'test content');

            component.clipboard();

            expect(clipboardSpy).toHaveBeenCalledWith('test content');
        });

        it('should send notification after successful copy', async () => {
            fixture.componentRef.setInput('text', 'test content');

            component.clipboard();
            await clipboardSpy.calls.mostRecent().returnValue;

            expect(notifBroadcasterSpy).toHaveBeenCalledWith([{
                message: 'AngularSdk.CoreCommon.TextCopied',
                warnLevel: jasmine.any(Object)
            }]);
        });

        it('should handle null text without error', () => {
            fixture.componentRef.setInput('text', null);

            expect(() => component.clipboard()).not.toThrow();
            expect(clipboardSpy).not.toHaveBeenCalled();
        });

        it('should handle undefined text without error', () => {
            expect(() => component.clipboard()).not.toThrow();
            expect(clipboardSpy).not.toHaveBeenCalled();
        });

        it('should copy text with whitespace', () => {
            fixture.componentRef.setInput('text', '   ');

            component.clipboard();

            expect(clipboardSpy).toHaveBeenCalledWith('   ');
        });

        it('should copy long text content', () => {
            const longText = 'A'.repeat(1000);
            fixture.componentRef.setInput('text', longText);

            component.clipboard();

            expect(clipboardSpy).toHaveBeenCalledWith(longText);
        });

        it('should copy text with special characters', () => {
            const specialText = 'Test\nNew line\tTab\r\n"Quotes"';
            fixture.componentRef.setInput('text', specialText);

            component.clipboard();

            expect(clipboardSpy).toHaveBeenCalledWith(specialText);
        });
    });
});
