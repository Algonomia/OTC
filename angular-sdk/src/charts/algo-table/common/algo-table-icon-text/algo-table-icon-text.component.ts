import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent} from "../../../../design-elements/algo-icon/algo-icon/algo-icon.component";

@Component({
    selector: 'app-algo-table-scope',
    imports: [
        TranslatePipe,
        AlgoIconComponent
    ],
    templateUrl: './algo-table-icon-text.component.html',
    styleUrl: './algo-table-icon-text.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableIconTextComponent {
    @Input() text!: string;
    @Input() icon!: string;
}
