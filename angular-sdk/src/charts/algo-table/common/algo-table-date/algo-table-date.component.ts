import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
    selector: 'app-algo-table-date',
    templateUrl: './algo-table-date.component.html',
    styleUrl: './algo-table-date.component.css',
    standalone: true,
    imports: [
        DatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableDateComponent {
    @Input() date: Date | undefined;
}
