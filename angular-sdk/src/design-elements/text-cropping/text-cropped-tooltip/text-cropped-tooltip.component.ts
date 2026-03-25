import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewChild,
} from '@angular/core';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { NgClass } from '@angular/common';
import { AlgoIconComponent } from '../../algo-icon/algo-icon/algo-icon.component';
import { MiddleEllipsisDirective } from '../ellipsis-middle.directive';
import { EdgePopoverComponent } from '../../../plugs/edge-popover/edge-popover.component';

@Component({
    selector: 'app-text-cropped-tooltip',
    imports: [
        TooltipModule,
        NgClass,
        AlgoIconComponent,
        MiddleEllipsisDirective,
        EdgePopoverComponent,
    ],
    templateUrl: './text-cropped-tooltip.component.html',
    styleUrl: './text-cropped-tooltip.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextCroppedTooltipComponent {
    @Input() textClass = '';
    @Input() text: string = '';
    @ViewChild(Tooltip) tooltip?: Tooltip;

    public isTruncated = false;

    public onTruncationChange(isTruncated: boolean): void {
        this.isTruncated = isTruncated;
    }
}
