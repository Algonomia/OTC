import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonExportComponent } from './button-export.component';
import { TranslateModule } from '@ngx-translate/core';
import {
    expectButtonSizeTheme,
    expectButtonDisabled,
    expectIconBehaviorWithBooleanText
} from '../button-test.helpers.spec';

describe('ButtonExportComponent', () => {
    let fixture: ComponentFixture<ButtonExportComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonExportComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonExportComponent);
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('wrapper button', () => {
        expectButtonSizeTheme(getFixture, 'Normal');
        expectButtonDisabled(getFixture, true);
        expectButtonDisabled(getFixture, false);
        expectIconBehaviorWithBooleanText(getFixture, 'System/Storage/CloudExport');
    });
});
