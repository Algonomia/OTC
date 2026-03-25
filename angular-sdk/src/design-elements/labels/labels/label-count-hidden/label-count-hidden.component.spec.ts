import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelCountHiddenComponent } from './label-count-hidden.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel
} from '../label-test.helpers.spec';

describe('LabelCountHiddenComponent', () => {
    let fixture: ComponentFixture<LabelCountHiddenComponent>;
    let component: LabelCountHiddenComponent;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelCountHiddenComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelCountHiddenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        counter: 0,
        color_theme: 'main-0',
        height: 34,
        border_theme: 'border-1',
        weight: 'Regular'
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'main-0',
        border_theme: 'border-1',
        height: 34,
        weight_font_theme: 'Regular'
    });

    describe('counter input with prefix', () => {
        it('should accept counter input via setInput', () => {
            fixture.componentRef.setInput('counter', 5);
            fixture.detectChanges();
            expect(component.counter).toBe(5);
        });

        it('should render counter with prefix "+"', () => {
            fixture.componentRef.setInput('counter', 5);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('+5');
        });

        it('should update counter when input changes', () => {
            fixture.componentRef.setInput('counter', 2);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('+2');

            fixture.componentRef.setInput('counter', 10);
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toContain('+10');
        });
    });
});
