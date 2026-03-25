import {ChangeDetectorRef, Directive, HostListener, Input} from '@angular/core';
import {AlgoIconWeightHandler} from '../weight-handler';

@Directive({
    selector: '[appIconHover]',
    standalone: true
})
export class IconHoverDirective {
    @Input() algoIconHandler?: AlgoIconWeightHandler;
    @Input() cd?: ChangeDetectorRef;

    @HostListener('mouseover') onMouseOver() {
        if (this.algoIconHandler) {
            this.algoIconHandler.onAddHoverLayer();
            this.cd?.markForCheck();
        }
    }

    @HostListener('mouseout') onMouseOut() {
        if (this.algoIconHandler) {
            this.algoIconHandler.onRemoveHoverLayer();
            this.cd?.markForCheck();
        }
    }
}
