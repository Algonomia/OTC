import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonGoBackComponent } from './button-go-back.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
   expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonGoBackComponent', () => {
    let fixture: ComponentFixture<ButtonGoBackComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonGoBackComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonGoBackComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Arrow/ArrowLeft', { position: 'left' });
    });
});
