import {
    ChangeDetectionStrategy,
    Component
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonQuitComponent} from '../../../design-elements/buttons/buttons/button-quit/button-quit.component';
import {ModalService} from '../../../global-services/modal.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-modal-quit-confirm',
    templateUrl: './modal-quit-confirm.component.html',
    styleUrl: './modal-quit-confirm.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonQuitComponent,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalQuitConfirmComponent {

    constructor(private _modalService: ModalService) {}

    closeModal() {
        this._modalService.closeWithResult(true);
    }
}
