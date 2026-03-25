import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, Input} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {DateSelectorComponent} from '../../../../date-selector/date-selector.component';
import {DateUtils, IDateConstant} from '@algonomia/ts-shared';
import {toObservable} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-edit-constant-date',
    imports: [
        AsyncPipe,
        DateSelectorComponent
    ],
  templateUrl: './edit-constant-date.component.html',
  styleUrl: './edit-constant-date.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantDateComponent {
    dateComplexValue = input<IDateConstant>();
    protected __date$ = toObservable(this.dateComplexValue).pipe(map(
        complexVal => DateUtils.convertSecTimestampToDate(complexVal?.value) ?? null)
    );

    constructor(private _cd: ChangeDetectorRef) {}

    changeValue(date: Date | null) {
        const complexValue = this.dateComplexValue();
        if (!complexValue) {
            return;
        }
        complexValue.value = DateUtils.convertDateToSecTimestamp(date) ?? -1;
        this._cd.markForCheck();
    }
}
