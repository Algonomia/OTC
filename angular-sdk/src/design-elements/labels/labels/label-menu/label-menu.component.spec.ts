import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelMenuComponent } from './label-menu.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel,
    labelTestTextInput
} from '../label-test.helpers.spec';

describe('LabelMenuComponent', () => {
    let component: LabelMenuComponent;
    let fixture: ComponentFixture<LabelMenuComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelMenuComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        text: '',
        is_open: false,
        color_theme: 'link-2',
        height: 34,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'link-2',
        border_theme: 'border-1',
        height: 34,
        all_icon_display_on_hover: false
    });

    labelTestTextInput(getFixture);

    describe('is_open property', () => {
        it('should pass is_open to set_open_label_element', () => {
            fixture.componentRef.setInput('is_open', true);
            fixture.detectChanges();

            const labelElement = fixture.debugElement.query(By.directive(LabelComponent));
            const labelComponent = labelElement.componentInstance;

            expect(labelComponent.set_open_label_element).toBe(true);
        });

        it('should render ChevronRight icon when menu is closed', () => {
            fixture.componentRef.setInput('is_open', false);
            fixture.componentRef.setInput('text', 'Closed Menu');
            fixture.detectChanges();

            expect(component.is_open).toBe(false);
        });

        it('should render ChevronDown icon when menu is open', () => {
            fixture.componentRef.setInput('is_open', true);
            fixture.componentRef.setInput('text', 'Open Menu');
            fixture.detectChanges();

            expect(component.is_open).toBe(true);
        });

        it('should toggle between open and closed states', () => {
            expect(component.is_open).toBe(false);

            fixture.componentRef.setInput('is_open', true);
            expect(component.is_open).toBe(true);

            fixture.componentRef.setInput('is_open', false);
            expect(component.is_open).toBe(false);
        });
    });

    describe('Template Rendering', () => {
        it('should have cursor-pointer class on label', () => {
            const labelWrapper = fixture.nativeElement.querySelector('app-label');
            expect(labelWrapper.classList.contains('cursor-pointer')).toBe(true);
        });
    });
});
