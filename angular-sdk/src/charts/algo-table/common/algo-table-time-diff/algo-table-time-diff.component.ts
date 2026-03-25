import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NullUndefinedUtils, TimeUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-algo-table-time-diff',
    imports: [],
    templateUrl: './algo-table-time-diff.component.html',
    styleUrl: './algo-table-time-diff.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableTimeDiffComponent implements OnInit {
    @Input() date!: Date;

    public timeDiffLabel!: string;

    constructor(private _translate: TranslateService) {}

    ngOnInit(): void {
        if (isNullOrUndefined(this.date)) {
            this.timeDiffLabel = '';
        } else {
            const timeDiff = TimeUtils.computeTimeDiffInDay(this.date.getTime());
            this.timeDiffLabel = `${timeDiff.number} ${this._translate.instant(timeDiff.text)}`;
        }
    }
}
