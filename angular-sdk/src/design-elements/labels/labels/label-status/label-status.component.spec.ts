import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelStatusComponent } from './label-status.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestPassPropertiesToLabel,
    labelTestIconInput,
    labelTestTextInput,
    labelTestRadiusInput,
    labelTestTypeColorMapping
} from '../label-test.helpers.spec';

describe('LabelStatusComponent', () => {
    let component: LabelStatusComponent;
    let fixture: ComponentFixture<LabelStatusComponent>;
    const getFixture = () => fixture;
    const createNewFixture = () => TestBed.createComponent(LabelStatusComponent);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelStatusComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Configuration', () => {
        it('should have correct default configuration', () => {
            expect(component.icon).toBe('');
            expect(component.text).toBe('');
            expect(component.radius).toBe('3px');
            expect(component.type).toBe('ok');
            expect(component.height).toBe(30);
            expect(component.border_theme).toBe('border-1');
            expect(component.weight).toBe('Regular');
        });
    });

    labelTestPassPropertiesToLabel(getFixture, {
        border_theme: 'border-1',
        height: 30,
        all_icon_display_on_hover: false,
        radius: '3px'
    });

    labelTestTypeColorMapping(createNewFixture, [
        { type: 'ok', expectedColorTheme: 'ok-0-outline' },
        { type: 'ko', expectedColorTheme: 'ko-0-outline' }
    ]);

    labelTestIconInput(getFixture, '.right-icon-light');

    labelTestTextInput(getFixture);

    labelTestRadiusInput(getFixture);
});
