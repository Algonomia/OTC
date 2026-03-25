import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonLinkOutlineComponent } from './button-link-outline.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled, expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonLinkOutlineComponent', () => {
    let fixture: ComponentFixture<ButtonLinkOutlineComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonLinkOutlineComponent, RouterTestingModule, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonLinkOutlineComponent);
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
