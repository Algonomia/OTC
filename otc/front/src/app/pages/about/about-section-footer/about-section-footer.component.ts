import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {
    ButtonMainActionOutlineComponent,
    ModalService,
    ScreenSizeHandlerComponent
} from '@algonomia/angular-sdk';
import {LegalNoticeModalComponent} from '../../../legals/legal-notice-modal/legal-notice-modal.component';

@Component({
    selector: 'app-about-section-footer',
    standalone: true,
    imports: [
        TranslatePipe,
        ButtonMainActionOutlineComponent,
        ScreenSizeHandlerComponent
    ],
    templateUrl: './about-section-footer.component.html',
    styleUrl: './about-section-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionFooterComponent {
    constructor(
        private _modalService: ModalService,
    ) {}

    public openLegalNoticeModal() {
        this._modalService.open(LegalNoticeModalComponent, 'medium');
    }
}
