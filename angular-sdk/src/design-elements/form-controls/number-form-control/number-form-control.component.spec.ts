import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberFormControlComponent } from './number-form-control.component';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('NumberFormControlComponent', () => {
    let component: NumberFormControlComponent;
    let fixture: ComponentFixture<NumberFormControlComponent>;
    let formControl: FormControl<number | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NumberFormControlComponent,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NumberFormControlComponent);
        component = fixture.componentInstance;

        formControl = new FormControl<number | null>(null);
        component.formControl = formControl;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render input with type number', () => {
        const inputDe: DebugElement = fixture.debugElement.query(By.css('input'));
        expect(inputDe).toBeTruthy();
        expect(inputDe.nativeElement.type).toBe('number');
    });

    it('should pass min and max to input', () => {
        fixture.componentRef.setInput('min', 5);
        fixture.componentRef.setInput('max', 10);
        fixture.detectChanges();

        const inputDe: DebugElement = fixture.debugElement.query(By.css('input'));
        expect(inputDe.nativeElement.min).toBe('5');
        expect(inputDe.nativeElement.max).toBe('10');
    });

    it('should pass placeholder to input', () => {
        fixture.componentRef.setInput('placeholder', 'Enter number');
        fixture.detectChanges();

        const inputDe: DebugElement = fixture.debugElement.query(By.css('input'));
        expect(inputDe.nativeElement.placeholder).toBe('Enter number');
    });
});
