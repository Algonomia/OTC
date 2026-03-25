import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {SelectHandler} from '../../handlers/select-handler/select-handler';
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {EDayCountType, EDayCountTypeExt, EPeriodUnit, EPeriodUnitExt, IPeriod} from '@algonomia/ts-shared';
import {StdMenuOverlayAdaptiveComponent} from '../menus/std-menu-overlay-adaptive/std-menu-overlay-adaptive.component';

@Component({
    selector: 'app-period-selector',
    templateUrl: './period-selector.component.html',
    styleUrl: './period-selector.component.css',
    imports: [
        CommonModule,
        TranslatePipe,
        StdMenuOverlayAdaptiveComponent,
    ],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodSelectorComponent extends ATemplateComponent implements OnInit {
    constructor(private _translateService: TranslateService) {
        super();
    }

    @Input() period: Partial<IPeriod> | null = null;
    @Input() valuePlaceholder?: string;
    @Input() unitPlaceholder?: string;
    @Input() countTypePlaceholder?: string;
    @Input() isValid: boolean = false;
    @Input() isInvalid: boolean = false;

    @Output() periodChange = new EventEmitter<Partial<IPeriod> | null>();

    protected periodUnitSelectHandler!: SelectHandler<EPeriodUnit, EPeriodUnit>;
    protected dayCountTypeSelectHandler!: SelectHandler<EDayCountType, EDayCountType>;

    ngOnInit() {
        this.periodUnitSelectHandler = this._createPeriodUnitSelectHandler(this.period?.unit);
        this.dayCountTypeSelectHandler = this._createDayCountTypeSelectHandler(this.period?.dayCountType);

        this.pipeTakeUntil(this.periodUnitSelectHandler.firstSelected$).subscribe(selectedPeriodUnit => {
            this._emitPeriodChange(this.period?.value, selectedPeriodUnit, this.period?.dayCountType);
        });

        this.pipeTakeUntil(this.dayCountTypeSelectHandler.firstSelected$).subscribe(selectedDayCountType => {
            this._emitPeriodChange(this.period?.value, this.period?.unit, selectedDayCountType);
        });
    }

    onValueChange(event: Event) {
        const newValue = Number((event.target as HTMLInputElement)?.value);
        this._emitPeriodChange(newValue, this.period?.unit, this.period?.dayCountType);
    }

    private _emitPeriodChange(value?: number, unit?: EPeriodUnit, dayCountType?: EDayCountType) {
        if (!value && !dayCountType && !unit) {
            this.periodChange.emit(null);
        } else {
            this.periodChange.emit({value, unit, dayCountType});
        }
    }

    private _createPeriodUnitSelectHandler(initial?: EPeriodUnit): SelectHandler<EPeriodUnit, EPeriodUnit> {
        const menu = EPeriodUnitExt.getAllIds();
        return SelectHandler.getMonoSelectHandler(
            menu, [], initial ? [initial] : [], undefined,
            (x: EPeriodUnit) => {
                const title = EPeriodUnitExt.getTitleFromId(x);
                return x ? this._translateService.instant(title) : x;
            }
        );
    }

    private _createDayCountTypeSelectHandler(initial?: EDayCountType): SelectHandler<EDayCountType, EDayCountType> {
        const menu = EDayCountTypeExt.getAllIds();
        return SelectHandler.getMonoSelectHandler(
            menu, [], initial ? [initial] : [], undefined,
            (x: EDayCountType) => {
                const title = EDayCountTypeExt.getTitleFromId(x);
                return !!title ? this._translateService.instant(title) : title;
            }
        );
    }
}
