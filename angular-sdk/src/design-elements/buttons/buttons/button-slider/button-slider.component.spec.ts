import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonSliderComponent } from './button-slider.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { ButtonMainActionComponent } from '../button-main-action/button-main-action.component';
import { WidthHeightListenerService, ScreenSize } from '../../../../global-services/width-height-listener.service';
import { BehaviorSubject } from 'rxjs';

describe('ButtonSliderComponent', () => {
    let fixture: ComponentFixture<ButtonSliderComponent>;
    let screenSizeSubject: BehaviorSubject<ScreenSize>;

    const getButtonMainAction = () => {
        const debugEl = fixture.debugElement.query(By.directive(ButtonMainActionComponent));
        return debugEl?.componentInstance as ButtonMainActionComponent;
    };

    beforeEach(async () => {
        screenSizeSubject = new BehaviorSubject<ScreenSize>(ScreenSize.normal);

        spyOnProperty(WidthHeightListenerService, 'windowScreenListener', 'get')
            .and.returnValue(screenSizeSubject.asObservable());

        await TestBed.configureTestingModule({
            imports: [ButtonSliderComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonSliderComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('normal screen', () => {
        beforeEach(() => {
            screenSizeSubject.next(ScreenSize.normal);
        });

        it('should use left_icon for type=prev', () => {
            fixture.detectChanges();

            const button = getButtonMainAction();
            expect(button.icon).toBe('Action/Arrow/ArrowLeft');
            expect(button.left_icon).toBe(true);
        });

        it('should use right icon for type=next', () => {
            fixture.componentRef.setInput('type', 'next');
            fixture.detectChanges();

            const button = getButtonMainAction();
            expect(button.icon).toBe('Action/Arrow/ArrowRight');
        });

        it('should show only icon when show_text=false', () => {
            fixture.componentRef.setInput('show_text', false);
            fixture.detectChanges();

            const button = getButtonMainAction();
            expect(button.icon).toBe('Action/Arrow/ArrowLeft');
        });
    });

    describe('small screen', () => {
        beforeEach(() => {
            screenSizeSubject.next(ScreenSize.small);
        });

        it('should show ArrowLeft for type=prev', () => {
            fixture.detectChanges();

            const button = getButtonMainAction();
            expect(button.icon).toBe('Action/Arrow/ArrowLeft');
        });

        it('should show ArrowRight for type=next', () => {
            fixture.componentRef.setInput('type', 'next');
            fixture.detectChanges();

            const button = getButtonMainAction();
            expect(button.icon).toBe('Action/Arrow/ArrowRight');
        });
    });
});
