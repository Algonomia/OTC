import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-display-range-input',
    imports: [
        AlgoIconComponent,
        TranslatePipe
    ],
    templateUrl: './display-range-input.component.html',
    styleUrls: ['./display-range-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DisplayRangeInputComponent),
            multi: true
        }
    ]
})
export class DisplayRangeInputComponent implements ControlValueAccessor {
    @Input() editable: boolean = true;
    @Input() min: number = 0;
    @Input() max: number = 100;
    @Input() step: number = 1;
    @Input() resettable: boolean = true;
    @Input() placeholder?: string;
    @Input() value: number = 0;
    @Output() clickValue = new EventEmitter<number>();

    private _onChange: (value: number | null) => void = () => {};
    private _onTouched: () => void = () => {};

    constructor(private _cd: ChangeDetectorRef) {}

    get isValid(): boolean {
        return this.value >= this.min && this.value <= this.max;
    }

    get isInvalid(): boolean {
        return !this.isValid;
    }

    writeValue(value: number | null): void {
        this.value = value ?? this.min;
        this._cd.markForCheck();
    }

    registerOnChange(fn: (value: number | null) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.editable = !isDisabled;
        this._cd.markForCheck();
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.setValue(input.valueAsNumber);
    }

    public setValue(value: number) {
        this.value = isNaN(value) ? this.min : value;
        if (this.editable) {
            this.clickValue.emit(this.value);
            this._onChange(this.value);
            this._onTouched();
        }
        this._cd.markForCheck();
    }

    public resetValue() {
        this.setValue(this.min);
    }

    public incrementValue() {
        const next_value = this.value + this.step;
        this.setValue(next_value > this.max ? this.max : next_value);
    }

    public decrementValue() {
        const next_value = this.value - this.step;
        this.setValue(next_value < this.min ? this.min : next_value);
    }

    public onBlur(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        if (input.value === '') {
            this.value = this.min;
            input.value = String(this.min);
        }
        this.setValue(this.value);
        this._onTouched();
    }
}
