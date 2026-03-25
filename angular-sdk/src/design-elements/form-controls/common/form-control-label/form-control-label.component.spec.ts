import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlLabelComponent } from './form-control-label.component';
import { TranslateModule } from '@ngx-translate/core';
import { LabelSecondaryLightComponent } from '../../../labels/labels/label-secondary-light/label-secondary-light.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FormControlLabelComponent', () => {
    let fixture: ComponentFixture<FormControlLabelComponent>;
    let component: FormControlLabelComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormControlLabelComponent,
                TranslateModule.forRoot(),
                LabelSecondaryLightComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FormControlLabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept label and required inputs', () => {
        fixture.componentRef.setInput('label', 'My Label');
        fixture.componentRef.setInput('required', true);
        fixture.detectChanges();

        expect(component.label).toBe('My Label');
        expect(component.required).toBeTrue();
    });

    it('should render label text if provided', () => {
        fixture.componentRef.setInput('label', 'Test Label');
        fixture.detectChanges();

        const labelEl = fixture.nativeElement.querySelector('.label-text');
        expect(labelEl).toBeTruthy();
        expect(labelEl.textContent).toContain('Test Label');
    });

    it('should render "Optional" label if required is false', () => {
        fixture.componentRef.setInput('label', 'Test Label');
        fixture.componentRef.setInput('required', false);
        fixture.detectChanges();

        const optionalEl = fixture.nativeElement.querySelector('app-label-secondary-light');
        expect(optionalEl).toBeTruthy();
    });
});
