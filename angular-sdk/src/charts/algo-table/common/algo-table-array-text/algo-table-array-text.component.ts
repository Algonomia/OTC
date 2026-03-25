import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
    selector: 'app-algo-table-array-text',
    imports: [],
    templateUrl: './algo-table-array-text.component.html',
    styleUrl: './algo-table-array-text.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableArrayTextComponent {
    @Input() texts!: string[];
}
