import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelValidatedComponent } from './label-validated.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel,
    labelTestTextInput
} from '../label-test.helpers.spec';

describe('LabelValidatedComponent', () => {
    let component: LabelValidatedComponent;
    let fixture: ComponentFixture<LabelValidatedComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelValidatedComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelValidatedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        text: '',
        color_theme: 'main-0',
        height: 34,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'main-0',
        border_theme: 'border-1',
        height: 34
    });

    labelTestTextInput(getFixture);
});
