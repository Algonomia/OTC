import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextFormControlComponent } from './text-form-control.component';
import { FormControlTemplateComponent } from '../common/form-control-template/form-control-template.component';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Component, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    template: `
        <app-text-form-control
            [formControl]="formControl"
            [label]="label"
            [required]="required"
            [minLength]="minLength"
            [maxLength]="maxLength"
            [placeholder]="placeholder">
        </app-text-form-control>
    `,
    standalone: true,
    imports: [TextFormControlComponent]
})
class TestHostComponent {
    formControl = new FormControl<string | null>(null);
    label = 'Test Label';
    required = true;
    minLength = 3;
    maxLength = 10;
    placeholder = 'Enter text';
    @ViewChild(TextFormControlComponent, { static: true }) component!: TextFormControlComponent;
}

describe('TextFormControlComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let componentElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TestHostComponent,
                ReactiveFormsModule,
                FormControlTemplateComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        componentElement = fixture.nativeElement;
    });

    it('should create', () => {
        expect(host.component).toBeTruthy();
    });

    it('should render FormControlTemplateComponent', () => {
        const templateComp = componentElement.querySelector('app-form-control-template');
        expect(templateComp).toBeTruthy();
    });

    it('should render input with placeholder', () => {
        const input = componentElement.querySelector('input') as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.placeholder).toBe('Enter text');
    });

    it('should apply minLength and maxLength to input', () => {
        const input = componentElement.querySelector('input') as HTMLInputElement;
        expect(input.minLength).toBe(3);
        expect(input.maxLength).toBe(10);
    });

    it('should mark input as invalid if too short', () => {
        host.formControl.setValidators([Validators.minLength(3)]);
        host.formControl.setValue('a');
        host.formControl.markAsTouched();
        fixture.detectChanges();

        const input = componentElement.querySelector('input') as HTMLInputElement;
        expect(input.classList.contains('error')).toBeTrue();
    });

    it('should mark input as valid if value is correct', () => {
        host.formControl.setValidators([Validators.minLength(3)]);
        host.formControl.setValue('abc');
        host.formControl.markAsTouched();
        fixture.detectChanges();

        const input = componentElement.querySelector('input') as HTMLInputElement;
        expect(input.classList.contains('valid')).toBeTrue();
    });

    it('should propagate errors to FormControlTemplateComponent', () => {
        host.formControl.setErrors({ required: true });
        host.formControl.markAsTouched();
        fixture.detectChanges();

        const templateComp = componentElement.querySelector('app-form-control-template');
        expect(templateComp).toBeTruthy();
    });
});
