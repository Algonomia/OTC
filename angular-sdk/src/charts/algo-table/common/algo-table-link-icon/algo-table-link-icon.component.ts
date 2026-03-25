import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent} from "../../../../design-elements/algo-icon/algo-icon/algo-icon.component";
import {IconHoverDirective} from '../../../../design-elements/algo-icon/algo-icon-hover/algo-icon-hover.directive';
import {AlgoIconWeightHandler, IconWeight} from '../../../../design-elements/algo-icon/weight-handler';

@Component({
    selector: 'app-algo-table-link-icon',
    imports: [
        TranslatePipe,
        AlgoIconComponent,
        IconHoverDirective
    ],
    templateUrl: './algo-table-link-icon.component.html',
    styleUrl: './algo-table-link-icon.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableLinkIconComponent implements OnInit {
    @Input() icon?: string;
    @Input() text!: string;
    @Input() link!: string;

    public algoIconHandler!: AlgoIconWeightHandler;
    public weightIcon: IconWeight = 'Normal';

    ngOnInit(): void {
        this.algoIconHandler = new AlgoIconWeightHandler(this.weightIcon, false);
    }
}
