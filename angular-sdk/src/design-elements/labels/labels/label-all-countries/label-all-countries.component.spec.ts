import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelAllCountriesComponent } from './label-all-countries.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel
} from '../label-test.helpers.spec';

describe('LabelAllCountriesComponent', () => {
    let fixture: ComponentFixture<LabelAllCountriesComponent>;
    let component: LabelAllCountriesComponent;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelAllCountriesComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelAllCountriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        color_theme: 'grey-2',
        height: 30,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'grey-2',
        border_theme: 'border-1',
        height: 30,
        weight_font_theme: 'Regular',
        all_icon_display_on_hover: false
    });

    describe('Template Rendering', () => {
        it('should render map icon', () => {
            const iconElement = fixture.nativeElement.querySelector('.left-icon-light');
            expect(iconElement).toBeTruthy();
        });

        it('should render text "CoreCommon.AllCountries"', () => {
            const textContent = fixture.nativeElement.textContent;
            expect(textContent).toContain('AngularSdk.CoreCommon.AllCountries');
        });
    });
});
