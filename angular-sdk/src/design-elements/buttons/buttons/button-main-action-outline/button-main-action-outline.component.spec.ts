import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonMainActionOutlineComponent } from './button-main-action-outline.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    getButtonInstance,
    expectButtonSizeTheme,
    expectButtonDisabled
} from '../button-test.helpers.spec';

describe('ButtonMainActionOutlineComponent', () => {
    let fixture: ComponentFixture<ButtonMainActionOutlineComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonMainActionOutlineComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonMainActionOutlineComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);

        describe('icon logic', () => {
            it('should pass rightIcon when text and icon are provided', () => {
                fixture.componentRef.setInput('text', 'Action Button');
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
                fixture.componentRef.setInput('text', 'Action Button');
                fixture.componentRef.setInput('icon', '');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe('');
                expect(button.rightIcon).toBe('');
            });
        });
    });
});
