import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent, LogoComponent} from '@algonomia/angular-sdk';
import {LinkedinConnectComponent} from '../sdk/global-components/linkedin-connect/linkedin-connect.component';
import {AuthLinkedinService} from '../sdk/global-services/auth.linkedin.service';

@Component({
    selector: 'app-otc-header',
    templateUrl: './otc-header.component.html',
    styleUrl: './otc-header.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        HeaderComponent,
        LogoComponent,
        LinkedinConnectComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OTCHeaderComponent {
    constructor(
        public authLinkedinService: AuthLinkedinService
    ) {}
}
