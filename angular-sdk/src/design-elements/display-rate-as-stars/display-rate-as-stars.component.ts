import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {ArrayUtils} from '@algonomia/ts-shared';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';

@Component({
    selector: 'app-display-rate-as-stars',
    imports: [
        AlgoIconComponent
    ],
    templateUrl: './display-rate-as-stars.component.html',
    styleUrl: './display-rate-as-stars.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class DisplayRateAsStarsComponent implements OnInit {
    @Input() clickable: boolean = true;
    @Input() maxRate: number = 5;
    @Input() value: number = 0;
    @Input() size: 'small' | 'regular' = 'regular';
    @Output() clickValue = new EventEmitter<number>()

    constructor(private _cd: ChangeDetectorRef) {}

    protected __rateArr: number[] = [];
    ngOnInit() {
        this.__rateArr = ArrayUtils.arrRange(1, this.maxRate);
        this._cd.markForCheck();
    }

    onClickValue(rate: number) {
        if (this.clickable) {
            this.clickValue.emit(rate);
        }
    }
}
