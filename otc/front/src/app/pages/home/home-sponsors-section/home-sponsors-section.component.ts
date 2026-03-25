import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ButtonLinkComponent} from '@algonomia/angular-sdk';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthLinkedinService} from '../../../sdk/global-services/auth.linkedin.service';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-home-sponsors-section',
    imports: [
        ButtonLinkComponent,
        TranslatePipe,
        AsyncPipe
    ],
    templateUrl: './home-sponsors-section.component.html',
    styleUrl: './home-sponsors-section.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSponsorsSectionComponent {
    constructor(
        public authLinkedinService: AuthLinkedinService,
    ) {}
}
