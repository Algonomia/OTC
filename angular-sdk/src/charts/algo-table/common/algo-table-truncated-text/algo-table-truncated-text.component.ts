import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {MiddleEllipsisDirective} from '../../../../design-elements/text-cropping/ellipsis-middle.directive';
import {AlgoIconComponent} from '../../../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {ButtonCloseComponent} from '../../../../design-elements/buttons/buttons/button-close/button-close.component';
import {ModalService} from '../../../../global-services/modal.service';

@Component({
    selector: 'app-algo-table-truncated-text',
    imports: [
        MiddleEllipsisDirective,
        AlgoIconComponent,
        ButtonCloseComponent,
    ],
    templateUrl: './algo-table-truncated-text.component.html',
    styleUrl: './algo-table-truncated-text.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableTruncatedTextComponent {
    @ViewChild('displayModal') displayModal!: TemplateRef<unknown>;
    @Input() displayValue!: string;

    protected __isTruncated = false;

    constructor(
        private _modalService: ModalService,
        private _cd: ChangeDetectorRef
    ) {}

    public onTruncationChange(isTruncated: boolean): void {
        this.__isTruncated = isTruncated;
        this._cd.markForCheck();
    }

    public openModal(): void {
        this._modalService.openTemplate(this.displayModal, undefined, 'medium');
    }

    public closeModal() {
        this._modalService.close();
    }
}
