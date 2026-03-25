import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelSecondaryLightComponent } from './label-secondary-light.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel,
    labelTestTextInput,
    labelTestIconInput
} from '../label-test.helpers.spec';

describe('LabelSecondaryLightComponent', () => {
    let component: LabelSecondaryLightComponent;
    let fixture: ComponentFixture<LabelSecondaryLightComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelSecondaryLightComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelSecondaryLightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        icon: '',
        color_theme: 'grey-1',
        height: 30,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'grey-1',
        border_theme: 'border-1',
        height: 30,
        all_icon_display_on_hover: false
    });

    labelTestTextInput(getFixture);

    labelTestIconInput(getFixture, '.left-icon-light');

    describe('icon optional property', () => {
        it('should render with icon when icon is provided', () => {
            const withIconFixture = TestBed.createComponent(LabelSecondaryLightComponent);
            const withIconComponent = withIconFixture.componentInstance;
            withIconComponent.icon = 'Action/Navigation/Check';
            withIconComponent.text = 'With Icon';
            withIconFixture.detectChanges();

            expect(withIconComponent.icon).toBeTruthy();
        });

        it('should render without icon when icon is undefined', () => {
            const withoutIconFixture = TestBed.createComponent(LabelSecondaryLightComponent);
            const withoutIconComponent = withoutIconFixture.componentInstance;
            withoutIconComponent.icon = undefined;
            withoutIconComponent.text = 'Without Icon';
            withoutIconFixture.detectChanges();

            expect(withoutIconComponent.icon).toBeFalsy();
        });
    });
});
