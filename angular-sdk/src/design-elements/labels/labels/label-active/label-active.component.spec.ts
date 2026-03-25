import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelActiveComponent } from './label-active.component';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../../label.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel
} from '../label-test.helpers.spec';

describe('LabelActiveComponent', () => {
    let component: LabelActiveComponent;
    let fixture: ComponentFixture<LabelActiveComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelActiveComponent,
                TranslateModule.forRoot(),
                LabelComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelActiveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        text: true,
        color_theme: 'ok-3-outline',
        height: 30,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'ok-3-outline',
        border_theme: 'border-1',
        height: 30,
        all_icon_display_on_hover: false
    });

    describe('Icon Rendering', () => {
        it('should render icon when text is true', () => {
            fixture.componentRef.setInput('text', true);
            fixture.detectChanges();

            const iconElement = fixture.nativeElement.querySelector('.left-icon-light');
            expect(iconElement).toBeTruthy();
        });

        it('should render icon when text is false', () => {
            fixture.componentRef.setInput('text', false);
            fixture.detectChanges();

            const iconElement = fixture.nativeElement.querySelector('.left-icon-light');
            expect(iconElement).toBeTruthy();
        });
    });
});
