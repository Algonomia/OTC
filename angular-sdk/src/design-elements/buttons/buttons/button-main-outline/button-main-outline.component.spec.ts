import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonMainOutlineComponent } from './button-main-outline.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    getButtonInstance,
    expectButtonSizeTheme,
    expectButtonDisabled
} from '../button-test.helpers.spec';

describe('ButtonMainOutlineComponent', () => {
    let fixture: ComponentFixture<ButtonMainOutlineComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonMainOutlineComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonMainOutlineComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'ExtraLarge');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);

        describe('icon logic', () => {
            it('should pass rightIcon when text and icon are provided', () => {
                fixture.componentRef.setInput('text', 'text');
                fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.rightIcon).toBe('Action/Navigation/Add');
                expect(button.singleIcon).toBe('');
            });

            it('should pass singleIcon when icon provided but no text', () => {
                fixture.componentRef.setInput('text', '');
                fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe('Action/Navigation/Add');
                expect(button.rightIcon).toBe('');
            });

            it('should not pass any icon when no icon provided', () => {
                fixture.componentRef.setInput('text', 'text');
                fixture.componentRef.setInput('icon', '');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe('');
                expect(button.rightIcon).toBe('');
            });
        });
    });
});
