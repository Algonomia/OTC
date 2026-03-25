import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import { DynamicDialogConfig} from 'primeng/dynamicdialog';
import {TranslatePipe} from '@ngx-translate/core';
import {HrefHandlerComponent, ButtonContinueComponent, AlgoIconComponent} from '@algonomia/angular-sdk';
import {AuthLinkedinService} from '../../../global-services/auth.linkedin.service';

@Component({
    selector: 'app-linkedin-login-modal',
    templateUrl: './linkedin-login-modal.component.html',
    styleUrl: './linkedin-login-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        AlgoIconComponent,
        TranslatePipe,
        ButtonContinueComponent,
        HrefHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedinLoginModalComponent implements OnInit {
    public inputs!: string;

    constructor(
        private _authLinkedin: AuthLinkedinService,
        public config: DynamicDialogConfig,
    ) {}

    ngOnInit() {
        this.inputs = this.config.data?.inputs;
    }

    public login(): void {
        this._authLinkedin.connect();
    }
}
