import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent, ATemplateComponent, ModalService, IAction, StdActionMenuWithPopover} from '@algonomia/angular-sdk';
import {AuthLinkedinService} from '../../global-services/auth.linkedin.service';
import {LinkedinLoginModalComponent} from './linkedin-login-modal/linkedin-login-modal.component';
import {TUser, UserUtils} from '@otc/domain';
import {EditModalComponent} from './edit-modal/edit-modal.component';

@Component({
    selector: 'app-linkedin-connect',
    templateUrl: './linkedin-connect.component.html',
    styleUrl: './linkedin-connect.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        AlgoIconComponent,
        StdActionMenuWithPopover,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedinConnectComponent extends ATemplateComponent implements OnInit {
    __actions: IAction<[]>[] = [{
        title: 'OTCFront.CoreCommon.Edit',
        callback: this.edit.bind(this)
    }, {
        title: 'OTCFront.CoreCommon.Logout',
        callback: this.logout.bind(this)
    }];

    __name: string = '';
    __picture: string = '';
    __connected = false;

    constructor(
        private _authLinkedin: AuthLinkedinService,
        private _modalService: ModalService,
        private _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this._authLinkedin.getUserInfo$).subscribe(async user => {
            this.user = user;
            this._cd.markForCheck();
        });
    }

    set user(user: TUser | undefined) {
        this.__connected = user !== undefined;
        this.__name = user === undefined ? '' : UserUtils.getUserFullName(user);
        this.__picture = user?.picture ?? 'assets/images/profile_placeholder.svg';
        this._cd.markForCheck();
    }

    public openLoginModal() {
        this._modalService.open(LinkedinLoginModalComponent, 'small');
    }

    public logout() {
        this._authLinkedin.disconnect();
    }

    public edit() {
        this._modalService.open(EditModalComponent, 'small-full-height', {});
    }

    showImage = true;
    updateShowImage() {
        this.showImage = false;
        this._cd.markForCheck();
    }
}
