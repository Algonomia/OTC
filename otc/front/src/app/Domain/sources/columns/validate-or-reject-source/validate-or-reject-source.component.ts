import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {SourceFetcherService} from '../../fetchers/source-fetcher.service';
import {ESourceStatus} from '@otc/domain';
import {
    ButtonCancelComponent,
    ButtonContinueComponent,
    ButtonRejectComponent,
    ButtonValidateComponent,
    MetaFormControlFactory,
    ModalService,
    TextFormControlComponent
} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-validate-or-reject-source',
    imports: [
        TextFormControlComponent,
        ButtonCancelComponent,
        ButtonContinueComponent,
        ButtonValidateComponent,
        ButtonRejectComponent
    ],
    templateUrl: './validate-or-reject-source.component.html',
    styleUrl: './validate-or-reject-source.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidateOrRejectSourceComponent {
    @Input() id!: number;
    @Input() status!: ESourceStatus;
    @ViewChild('validateModal') validateModal!: TemplateRef<any>;
    @ViewChild('rejectModal') rejectModal!: TemplateRef<any>;

    commentFormControl = MetaFormControlFactory.createStringFormControl({label: 'OTCFront.CoreCommon.AddComment'});

    ESourceStatus = ESourceStatus;
    constructor(
        private _sourceFetcher: SourceFetcherService,
        private _cd: ChangeDetectorRef,
        private _modalService: ModalService
    ) {}

    openValidateModal() {
        this._modalService.openTemplate(this.validateModal);
        this._cd.markForCheck();
    }

    openRejectModal() {
        this._modalService.openTemplate(this.rejectModal);
        this._cd.markForCheck();
    }

    validate() {
        this._sourceFetcher.validateSource(this.id, this.commentFormControl.value ?? '').then(_ => {
            this.closeModal();
        });
    }

    reject() {
        this._sourceFetcher.rejectSource(this.id, this.commentFormControl.value ?? '').then(_ => {
            this.closeModal();
        });
    }

    closeModal() {
        this._modalService.close();
        this._cd.markForCheck();
    }
}
