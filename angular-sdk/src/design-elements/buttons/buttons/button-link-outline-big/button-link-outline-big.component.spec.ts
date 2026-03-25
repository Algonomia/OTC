import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonLinkOutlineBigComponent } from './button-link-outline-big.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
   expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonLinkOutlineBigComponent', () => {
    let fixture: ComponentFixture<ButtonLinkOutlineBigComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonLinkOutlineBigComponent, RouterTestingModule, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonLinkOutlineBigComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'ExtraLarge');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Arrow/ArrowRight');
    });
});
