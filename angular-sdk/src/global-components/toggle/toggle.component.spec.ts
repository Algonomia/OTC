import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ToggleComponent} from './toggle.component';

describe('ToggleComponent', () => {
    let component: ToggleComponent;
    let fixture: ComponentFixture<ToggleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToggleComponent, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ToggleComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('isActuallyDisabled', () => {
        it('should return false by default', () => {
            expect(component.isActuallyDisabled()).toBeFalse();
        });

        it('should return true when blocked', () => {
            fixture.componentRef.setInput('blocked', true);
            expect(component.isActuallyDisabled()).toBeTrue();
        });

        it('should return true when enabled and blockedWhenEnabled', () => {
            fixture.componentRef.setInput('enabled', true);
            fixture.componentRef.setInput('blockedWhenEnabled', true);
            expect(component.isActuallyDisabled()).toBeTrue();
        });

        it('should return false when enabled and blockedWhenEnabled is null', () => {
            fixture.componentRef.setInput('enabled', true);
            fixture.componentRef.setInput('blockedWhenEnabled', null);
            expect(component.isActuallyDisabled()).toBeFalse();
        });

        it('should return true when not enabled and blockedWhenNotEnabled', () => {
            fixture.componentRef.setInput('blockedWhenNotEnabled', true);
            expect(component.isActuallyDisabled()).toBeTrue();
        });

        it('should return false when not enabled and blockedWhenNotEnabled is null', () => {
            fixture.componentRef.setInput('blockedWhenNotEnabled', null);
            expect(component.isActuallyDisabled()).toBeFalse();
        });

        it('should return false when enabled and blockedWhenNotEnabled is true', () => {
            fixture.componentRef.setInput('enabled', true);
            fixture.componentRef.setInput('blockedWhenNotEnabled', true);
            expect(component.isActuallyDisabled()).toBeFalse();
        });

        it('should return false when not enabled and blockedWhenEnabled is true', () => {
            fixture.componentRef.setInput('blockedWhenEnabled', true);
            expect(component.isActuallyDisabled()).toBeFalse();
        });
    });

    describe('toggle', () => {
        it('should flip enabled from false to true', () => {
            component.toggle();
            expect(component.enabled).toBeTrue();
        });

        it('should flip enabled from true to false', () => {
            fixture.componentRef.setInput('enabled', true);
            component.toggle();
            expect(component.enabled).toBeFalse();
        });

        it('should emit the new enabled value', () => {
            spyOn(component.enabledChange, 'emit');
            component.toggle();
            expect(component.enabledChange.emit).toHaveBeenCalledWith(true);
        });

        it('should not toggle when blocked', () => {
            fixture.componentRef.setInput('blocked', true);
            component.toggle();
            expect(component.enabled).toBeFalse();
        });

        it('should not toggle when enabled and blockedWhenEnabled', () => {
            fixture.componentRef.setInput('enabled', true);
            fixture.componentRef.setInput('blockedWhenEnabled', true);
            component.toggle();
            expect(component.enabled).toBeTrue();
        });

        it('should not toggle when not enabled and blockedWhenNotEnabled', () => {
            fixture.componentRef.setInput('blockedWhenNotEnabled', true);
            component.toggle();
            expect(component.enabled).toBeFalse();
        });

        it('should not emit enabledChange when disabled', () => {
            spyOn(component.enabledChange, 'emit');
            fixture.componentRef.setInput('blocked', true);
            component.toggle();
            expect(component.enabledChange.emit).not.toHaveBeenCalled();
        });
    });

    describe('Template Rendering', () => {
        it('should not render text when text is empty', () => {
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('.text')).toBeNull();
        });

        it('should render text when text is provided', () => {
            fixture.componentRef.setInput('text', 'My Label');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('.text')).toBeTruthy();
        });

        it('should render icons when both iconLeft and iconRight are provided', () => {
            fixture.componentRef.setInput('iconLeft', 'Action/Formatting/Edit');
            fixture.componentRef.setInput('iconRight', 'Action/Formatting/Variable');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelectorAll('app-algo-icon').length).toBe(2);
        });

        it('should not render icons when only iconLeft is provided', () => {
            fixture.componentRef.setInput('iconLeft', 'Action/Formatting/Edit');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelectorAll('app-algo-icon').length).toBe(0);
        });

        it('should not render icons when only iconRight is provided', () => {
            fixture.componentRef.setInput('iconRight', 'Action/Formatting/Variable');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelectorAll('app-algo-icon').length).toBe(0);
        });

        it('should not render icons when no icons are provided', () => {
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelectorAll('app-algo-icon').length).toBe(0);
        });

        it('should disable checkbox when blocked', () => {
            fixture.componentRef.setInput('blocked', true);
            fixture.detectChanges();
            const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
            expect(checkbox.disabled).toBeTrue();
        });

        it('should enable checkbox when not blocked', () => {
            fixture.detectChanges();
            const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
            expect(checkbox.disabled).toBeFalse();
        });

        it('should call toggle on checkbox change event', () => {
            spyOn(component, 'toggle');
            fixture.detectChanges();
            fixture.nativeElement.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change'));
            expect(component.toggle).toHaveBeenCalled();
        });
    });
});
