import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {LabelActiveComponent} from '../../../../design-elements/labels/labels/label-active/label-active.component';
import {LabelExpiredComponent} from '../../../../design-elements/labels/labels/label-expired/label-expired.component';

@Component({
    selector: 'app-algo-table-active-or-expired',
    imports: [
        LabelActiveComponent,
        LabelExpiredComponent
    ],
    templateUrl: './algo-table-active-or-expired.component.html',
    styleUrl: './algo-table-active-or-expired.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableActiveOrExpiredComponent {
    @Input() isActive!: boolean;
}
