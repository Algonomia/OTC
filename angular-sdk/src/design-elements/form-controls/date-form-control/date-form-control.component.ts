import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FormControl, FormsModule} from '@angular/forms';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import { DatePickerModule } from 'primeng/datepicker';
import {BehaviorSubject, switchMap, tap} from 'rxjs';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {AsyncPipe} from '@angular/common';
import {DateSelectorComponent} from '../../date-selector/date-selector.component';

@Component({
    selector: 'app-date-form-control',
    imports: [
        FormControlTemplateComponent,
        FormsModule,
        DatePickerModule,
        AsyncPipe,
        DateSelectorComponent
    ],
    templateUrl: './date-form-control.component.html',
    styleUrl: './date-form-control.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFormControlComponent extends ATemplateComponent implements OnInit {
    @Input() formControl!: FormControl<Date | null>;
    @Input() minDate?: Date;
    @Input() maxDate?: Date;
    @Input() withTime: boolean = false;
    @Input() placeholder?: string;
    @Input() label?: string;
    @Input() required?: boolean;

    protected __value$ = new BehaviorSubject<Date | null>(null);

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    onDateChange(date: Date | null) {
        this.__value$.next(date);
    }

    ngOnInit() {
        this.__value$.next(this?.formControl?.value);

        this.pipeTakeUntil(
            this.__value$.pipe(
                tap(date => {
                    if (this.formControl.value?.getTime() === date?.getTime()) {
                        return;
                    }
                    this.formControl.setValue(date);
                    this.formControl.markAllAsTouched();
                    this._cd.markForCheck();
                }),
                switchMap(_ => this.formControl.valueChanges)
            )
        ).subscribe(date => {
            if (this.__value$.getValue() === date) {
                return;
            }
            this.__value$.next(date);
        });
    }
}
