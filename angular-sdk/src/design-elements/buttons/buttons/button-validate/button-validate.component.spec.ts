import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonValidateComponent } from './button-validate.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
   expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonValidateComponent', () => {
    let fixture: ComponentFixture<ButtonValidateComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonValidateComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonValidateComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Navigation/Exit', { trigger: 'icon', hasLeftIconInput: true });
    });
});
