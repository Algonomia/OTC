import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonCloseComponent } from './button-close.component';
import { TranslateModule } from '@ngx-translate/core';
import { expectButtonSizeTheme } from '../button-test.helpers.spec';

describe('ButtonCloseComponent', () => {
    let fixture: ComponentFixture<ButtonCloseComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonCloseComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonCloseComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
    });
});
