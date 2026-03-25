import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonTuneComponent } from './button-tune.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled, expectIconBehaviorWithBooleanText
} from '../button-test.helpers.spec';

describe('ButtonTuneComponent', () => {
    let fixture: ComponentFixture<ButtonTuneComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonTuneComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonTuneComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithBooleanText(getFixture, 'People/User/Configuration2', { hasLeftIconInput: true });
    });
});
