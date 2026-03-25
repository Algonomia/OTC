import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {EValuesStatus} from '@otc/domain';
import {ValuesFetcherService} from '../../fetchers/values-fetcher.service';
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
    selector: 'app-validate-or-reject-value',
    imports: [
        ButtonCancelComponent,
        ButtonContinueComponent,
        TextFormControlComponent,
        ButtonRejectComponent,
        ButtonValidateComponent
    ],
    templateUrl: './validate-or-reject-value.component.html',
    styleUrl: './validate-or-reject-value.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidateOrRejectValueComponent {
    @Input() id!: number;
    @Input() status!: EValuesStatus;
    @ViewChild('validateModal') validateModal!: TemplateRef<any>;
    @ViewChild('rejectModal') rejectModal!: TemplateRef<any>;

    commentFormControl = MetaFormControlFactory.createStringFormControl({label: 'OTCFront.CoreCommon.AddComment'});

    valueStatus = EValuesStatus;
    constructor(
        private _valuesFetcher: ValuesFetcherService,
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
        this._valuesFetcher.validateValue(this.id, this.commentFormControl.value ?? '').then(_ => {
            this.closeModal();
        });
    }

    reject() {
        this._valuesFetcher.rejectValue(this.id, this.commentFormControl.value ?? '').then(_ => {
            this.closeModal();
        });
    }

    closeModal() {
        this._modalService.close();
        this._cd.markForCheck();
    }
}
