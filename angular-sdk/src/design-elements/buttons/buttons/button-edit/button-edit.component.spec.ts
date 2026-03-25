import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonEditComponent } from './button-edit.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
   expectIconBehaviorWithStringText
} from '../button-test.helpers.spec';

describe('ButtonEditComponent', () => {
    let fixture: ComponentFixture<ButtonEditComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonEditComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonEditComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithStringText(getFixture, 'Action/Formatting/Edit', { hasLeftIconInput: true });
    });
});
