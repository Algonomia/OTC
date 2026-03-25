import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';
import {IconWeight} from '../algo-icon/weight-handler';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-big-button',
    templateUrl: './big-button.component.html',
    styleUrl: './big-button.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        AlgoIconComponent,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigButtonComponent implements OnInit {
    @Input() text!: string;
    @Input() icon!: string;

    public weight_font_theme: IconWeight = 'Normal';

    constructor() {}

    ngOnInit() {
    }
}
