import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelInfoComponent } from './label-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../../label.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel,
    labelTestIconInput,
    labelTestTextInput,
    labelTestRadiusInput
} from '../label-test.helpers.spec';

describe('LabelInfoComponent', () => {
    let component: LabelInfoComponent;
    let fixture: ComponentFixture<LabelInfoComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelInfoComponent,
                TranslateModule.forRoot(),
                LabelComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        icon: '',
        text: '',
        radius: '3px',
        color_theme: 'main-0',
        height: 30,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'main-0',
        border_theme: 'border-1',
        height: 30,
        radius: '3px',
        all_icon_display_on_hover: false
    });

    labelTestIconInput(getFixture, '.left-icon-light');

    labelTestTextInput(getFixture);

    labelTestRadiusInput(getFixture);
});
