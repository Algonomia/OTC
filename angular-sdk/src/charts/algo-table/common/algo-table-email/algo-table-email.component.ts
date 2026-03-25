import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
    selector: 'app-algo-table-email',
    imports: [],
    templateUrl: './algo-table-email.component.html',
    styleUrl: './algo-table-email.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableEmailComponent {
    @Input() text!: string;
}
