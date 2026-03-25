import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonContinueComponent } from './button-continue.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    getButtonInstance,
    expectButtonSizeTheme,
    expectButtonDisabled, expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonContinueComponent', () => {
    let fixture: ComponentFixture<ButtonContinueComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonContinueComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonContinueComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Arrow/ArrowRight', { hasLeftIconInput: true });
    });
});
