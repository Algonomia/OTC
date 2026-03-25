import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
    ButtonLinkOutlineBigComponent,
    ButtonLinkOutlineComponent,
    ButtonMainOutlineComponent,
    ModalService
} from '@algonomia/angular-sdk';
import {TranslatePipe} from '@ngx-translate/core';
import {
    LinkedinLoginModalComponent
} from '../../../sdk/global-components/linkedin-connect/linkedin-login-modal/linkedin-login-modal.component';
import {AuthLinkedinService} from '../../../sdk/global-services/auth.linkedin.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {LinkedinConnectComponent} from '../../../sdk/global-components/linkedin-connect/linkedin-connect.component';

@Component({
    selector: 'app-home-intro-section',
    imports: [
        ButtonLinkOutlineBigComponent,
        TranslatePipe,
        ButtonMainOutlineComponent,
        AsyncPipe,
        LinkedinConnectComponent,
        ButtonLinkOutlineComponent
    ],
    templateUrl: './home-intro-section.component.html',
    styleUrl: './home-intro-section.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeIntroSectionComponent {
    __isConnected$?: Observable<boolean>;

    constructor(private _modalService: ModalService, private _authService: AuthLinkedinService) {
        this.__isConnected$ = _authService.isConnected$;
    }

    public openLoginModal() {
        this._modalService.open(LinkedinLoginModalComponent, 'small');
    }
}
