import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonCancelComponent } from './button-cancel.component';
import { TranslateModule } from '@ngx-translate/core';
import { expectButtonSizeTheme } from '../button-test.helpers.spec';

describe('ButtonCancelComponent', () => {
    let fixture: ComponentFixture<ButtonCancelComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonCancelComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonCancelComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
    });
});
