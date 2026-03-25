import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelCounterComponent } from './label-counter.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel,
    labelTestCounterInput
} from '../label-test.helpers.spec';

describe('LabelCounterComponent', () => {
    let fixture: ComponentFixture<LabelCounterComponent>;
    let component: LabelCounterComponent;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelCounterComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelCounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        counter: 0,
        color_theme: 'orange-3',
        height: 28,
        border_theme: 'border-none',
        weight: 'Medium'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'orange-3',
        border_theme: 'border-none',
        height: 28,
        weight_font_theme: 'Medium'
    });

    labelTestCounterInput(getFixture);
});
