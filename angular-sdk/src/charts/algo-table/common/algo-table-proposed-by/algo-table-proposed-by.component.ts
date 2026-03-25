import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
    selector: 'app-algo-table-proposed-by',
    imports: [],
    templateUrl: './algo-table-proposed-by.component.html',
    styleUrl: './algo-table-proposed-by.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableProposedByComponent {
    @Input() text!: string;
}
