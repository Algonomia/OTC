import {Component, Injector} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {setAppInjector} from './injector';
import {
    ATemplateComponent,
    CountriesService,
    LangHandlerService,
    ModalService,
    NotificationHandlerComponent,
    WidthHeightListenerService,
    setAppInjector as setSdkAppInjector
} from '@algonomia/angular-sdk';
import {OTCHeaderComponent} from './otc-header/otc-header.component';
import {AuthLinkedinService} from './sdk/global-services/auth.linkedin.service';
import {UserStatus} from './sdk/global-services/auth.interface';
import {EditModalComponent} from './sdk/global-components/linkedin-connect/edit-modal/edit-modal.component';
import {CguModalComponent} from './legals/cgu-modal/cgu-modal.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [
        RouterOutlet,
        OTCHeaderComponent,
        NotificationHandlerComponent
    ],
})
export class AppComponent extends ATemplateComponent {
    constructor(
        injector: Injector,
        private _translateService: TranslateService,
        private _modalService: ModalService,
        private _authService: AuthLinkedinService,
        private _widthHeightListenerService: WidthHeightListenerService, // need initing
        private _langHandlerService: LangHandlerService, // need initing
        private _countriesService: CountriesService // need initing
    ) {
        super();
        setAppInjector(injector);
        setSdkAppInjector(injector);
        this._translateService.setDefaultLang('en');

        this.pipeTakeUntil(this._authService.userStatus$).subscribe(userStatus => {
            this._modalService.close();
            if (userStatus === UserStatus.CGU) {
                this._modalService.open(CguModalComponent, 'medium', {}, undefined, false);
            } else if (userStatus === UserStatus.PROFILE) {
                this._modalService.open(EditModalComponent, 'small-full-height', {}, undefined, false);
            }
        });
    }
}
