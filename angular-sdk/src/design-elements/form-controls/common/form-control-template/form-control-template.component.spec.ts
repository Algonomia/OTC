import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlTemplateComponent } from './form-control-template.component';
import { NO_ERRORS_SCHEMA, Component, TemplateRef, ViewChild } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    imports: [FormControlTemplateComponent],
    standalone: true,
    template: `
        <ng-template #inputTemplate>
            <input type="text">
        </ng-template>
        <app-form-control-template
            [label]="label"
            [required]="required"
            [inputTpl]="inputTemplate"
            [displayErrors]="displayErrors"
            [errors]="errors">
        </app-form-control-template>
    `
})
class TestHostComponent {
    label = 'Test Label';
    required = true;
    displayErrors = true;
    errors: ValidationErrors | null = null;
    @ViewChild('inputTemplate', { static: true }) inputTemplate!: TemplateRef<any>;
}

describe('FormControlTemplateComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let componentElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormControlTemplateComponent,
                TestHostComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        componentElement = fixture.nativeElement;
    });

    it('should create', () => {
        const component = componentElement.querySelector('app-form-control-template');
        expect(component).toBeTruthy();
    });

    it('should render FormControlLabelComponent', () => {
        const labelComponent = componentElement.querySelector('app-form-control-label');
        expect(labelComponent).toBeTruthy();
    });

    it('should render the correct label text', () => {
        const labelElement: HTMLElement | null = componentElement.querySelector('.label-text');
        expect(labelElement?.textContent?.trim()).toContain('Test Label');
    });

    it('should render input template', () => {
        const inputElement = componentElement.querySelector('input');
        expect(inputElement).toBeTruthy();
    });

    it('should render FormControlErrorsComponent', () => {
        const errorsComponent = componentElement.querySelector('app-form-control-errors');
        expect(errorsComponent).toBeTruthy();
    });

    it('should update when inputs change', () => {
        fixture.componentInstance.label = 'New Label';
        fixture.detectChanges();

        const labelElement: HTMLElement | null = componentElement.querySelector('.label-text');
        expect(labelElement?.textContent?.trim()).toContain('New Label');
    });
});
