import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {DateUtils} from '@algonomia/ts-shared';
import {DatePickerModule} from 'primeng/datepicker';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {UtcToLocalPipe} from '../../pipes/utc-to-local.pipe';

@Component({
  selector: 'app-date-selector',
    imports: [
        DatePickerModule,
        TranslatePipe,
        FormsModule,
        UtcToLocalPipe
    ],
  templateUrl: './date-selector.component.html',
  styleUrl: './date-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DateSelectorComponent {
    @Input() utcDate: Date | null = null;
    @Input() minDate?: Date;
    @Input() maxDate?: Date;
    @Input() withTime: boolean = false;
    @Input() placeholder?: string;
    @Output() utcDateChange = new EventEmitter<Date | null>();

    // With time: User picks "14:00" meaning 14:00 in their timezone.
    //            The Date object already represents the correct UTC moment internally.
    //            No conversion needed.
    //
    // Date only: User picks "Dec 23" meaning "Dec 23 in UTC" (not their local midnight).
    //            We reinterpret the local date values as UTC to match this expectation.
    onDateSelect(date?: Date) {
        if (!date) {
            this.utcDateChange.emit(null);
            return;
        }

        if (this.withTime) {
            this.utcDateChange.emit(date);
        } else {
            this.utcDateChange.emit(DateUtils.localToUtc(date));
        }
    }
}
