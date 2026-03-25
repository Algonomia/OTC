import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
    BarComponent,
    ButtonAddComponent,
    ButtonEditOutlineComponent,
    ScreenSizeHandlerComponent
} from '@algonomia/angular-sdk';
import {SourceModalComponent} from '../../../Domain/sources/source-modal/source-modal.component';
import {ContributionModalComponent} from '../../../Domain/contribution/contribution-modal/contribution-modal.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-contribution-bar',
    imports: [
        ButtonAddComponent,
        BarComponent,
        ScreenSizeHandlerComponent,
        NgTemplateOutlet,
        ButtonEditOutlineComponent,
    ],
    templateUrl: './contribution-bar.component.html',
    styleUrl: './contribution-bar.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContributionBarComponent {
    constructor() {}

    public openChoiceSourceModal() {
        SourceModalComponent.open();
    }

    public openContributionModal() {
        ContributionModalComponent.openUnrestrictedContribution();
    }
}
