import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
    selector: 'app-algo-table-comment',
    imports: [],
    templateUrl: './algo-table-comment.component.html',
    styleUrl: './algo-table-comment.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableCommentComponent {
    @Input() text!: string;
}
