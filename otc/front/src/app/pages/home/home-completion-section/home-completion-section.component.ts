import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {ButtonLinkComponent, CompletionBarComponent} from '@algonomia/angular-sdk';
import {AuthLinkedinService} from '../../../sdk/global-services/auth.linkedin.service';
import {CompletionFetcherService} from '../../../Domain/completion/completion-fetcher.service';

@Component({
    selector: 'app-home-completion-section',
    templateUrl: './home-completion-section.component.html',
    styleUrl: './home-completion-section.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonLinkComponent,
        CompletionBarComponent,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeCompletionSectionComponent implements OnInit {
    completion: number = 0;

    constructor(
        private _completionFetcherService: CompletionFetcherService,
        private _cdr: ChangeDetectorRef,
        public authLinkedinService: AuthLinkedinService
    ) {}

    ngOnInit() {
        this._completionFetcherService.getOverallCompletion().then((completion: number) => {
            this.completion = completion;
            this._cdr.markForCheck();
        });
    }
}
