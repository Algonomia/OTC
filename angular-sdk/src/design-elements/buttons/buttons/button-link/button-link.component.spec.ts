import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonLinkComponent } from './button-link.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
   expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonLinkComponent', () => {
    let fixture: ComponentFixture<ButtonLinkComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonLinkComponent, RouterTestingModule, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonLinkComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Arrow/ArrowRight');
    });
});
