import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {EMonth, EMonthExt, IDayMonth} from '@algonomia/ts-shared';
import {SelectHandler} from '../../handlers/select-handler/select-handler';
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {StdMenuOverlayAdaptiveComponent} from '../menus/std-menu-overlay-adaptive/std-menu-overlay-adaptive.component';

@Component({
  selector: 'app-day-month-selector',
    imports: [
        TranslatePipe,
        StdMenuOverlayAdaptiveComponent
    ],
  templateUrl: './day-month-selector.component.html',
  styleUrl: './day-month-selector.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayMonthSelectorComponent extends ATemplateComponent implements OnInit {
    @Input() value: Partial<IDayMonth> | null = null;
    @Input() dayPlaceholder?: string;
    @Input() monthPlaceholder?: string;
    @Input() isValid?: boolean;
    @Input() hasError?: boolean;
    @Input() showValidation?: boolean;

    @Output() valueChange = new EventEmitter<Partial<IDayMonth> | null>();

    protected __monthSelectHandler!: SelectHandler<EMonth, EMonth>;
    protected __maxDay = 31;

    constructor(
        private _cd: ChangeDetectorRef,
        private _translateService: TranslateService
    ) {
        super();
    }

    ngOnInit() {
        this.__monthSelectHandler = this._createMonthSelectHandler(this.value?.month);
        this.pipeTakeUntil(this.__monthSelectHandler.firstSelected$).subscribe(selectedMonth => {
            this._changeMonth(selectedMonth);
        });
    }

    private _createMonthSelectHandler(initialMonth?: EMonth): SelectHandler<EMonth, EMonth> {
        const month_menu = EMonthExt.getAllIds();
        return SelectHandler.getMonoSelectHandler(
            month_menu,
            [],
            initialMonth ? [initialMonth] : [],
            undefined,
            (x: EMonth) => this._translateService.instant(EMonthExt.getTitleFromId(x))
        );
    }

    protected __changeDayEvent(event: Event) {
        const newDay = Number((event.target as HTMLInputElement)?.value);
        return this._changeDay(newDay);
    }

    private _changeDay(newDay: number) {
        if (this.value?.day === newDay) {
            return;
        }
        const month = this.value?.month;
        if (!newDay && !month) {
            this.valueChange.emit(null);
        } else {
            this.valueChange.emit({day: newDay, month: month});
        }
        this._cd.markForCheck();
    }

    private _changeMonth(newMonth?: EMonth) {
        if (this.value?.month === newMonth) {
            return;
        }
        this.__maxDay = EMonthExt.getMaxDayFromId(newMonth);
        let day = this.value?.day;
        if (day && day > this.__maxDay) {
            day = this.__maxDay;
        }
        if (!day && !newMonth) {
            this.valueChange.emit(null);
        } else {
            this.valueChange.emit({day: day, month: newMonth});
        }
        this._cd.markForCheck();
    }
}
