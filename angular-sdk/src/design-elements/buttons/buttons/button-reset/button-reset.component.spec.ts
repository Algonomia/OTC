import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonResetComponent } from './button-reset.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled
} from '../button-test.helpers.spec';

describe('ButtonResetComponent', () => {
    let fixture: ComponentFixture<ButtonResetComponent>;

    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonResetComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonResetComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
    });
});
