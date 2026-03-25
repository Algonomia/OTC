import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonMainActionComponent } from './button-main-action.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    getButtonInstance,
    expectButtonSizeTheme,
    expectButtonDisabled
} from '../button-test.helpers.spec';

describe('ButtonMainActionComponent', () => {
    let fixture: ComponentFixture<ButtonMainActionComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonMainActionComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonMainActionComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Regular');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);

        describe('icon logic', () => {
            it('should pass rightIcon when text and icon provided (left_icon=false)', () => {
                fixture.componentRef.setInput('text', 'Button');
                fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
                fixture.componentRef.setInput('left_icon', false);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.rightIcon).toBe('Action/Navigation/Add');
                expect(button.leftIcon).toBe('');
                expect(button.singleIcon).toBe('');
            });

            it('should pass leftIcon when text and icon provided (left_icon=true)', () => {
                fixture.componentRef.setInput('text', 'Button');
                fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
                fixture.componentRef.setInput('left_icon', true);
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.leftIcon).toBe('Action/Navigation/Add');
                expect(button.rightIcon).toBe('');
                expect(button.singleIcon).toBe('');
            });

            it('should pass singleIcon when icon provided but no text', () => {
                fixture.componentRef.setInput('text', '');
                fixture.componentRef.setInput('icon', 'Action/Navigation/Add');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe('Action/Navigation/Add');
                expect(button.leftIcon).toBe('');
                expect(button.rightIcon).toBe('');
            });

            it('should not pass any icon when no icon provided', () => {
                fixture.componentRef.setInput('text', 'Button');
                fixture.detectChanges();

                const button = getButtonInstance(fixture);
                expect(button.singleIcon).toBe('');
                expect(button.leftIcon).toBe('');
                expect(button.rightIcon).toBe('');
            });
        });
    });
});
