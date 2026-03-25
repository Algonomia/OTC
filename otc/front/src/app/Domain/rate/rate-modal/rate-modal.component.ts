import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit, TemplateRef,
    ViewChild
} from '@angular/core';
import {IOTCDatumId, ISubmitRate, submitRateValidator} from '@otc/domain';
import {AppInjector} from '../../../injector';
import {
    ButtonCancelComponent,
    ButtonContinueComponent,
    ButtonGotItComponent,
    DoneStepComponent,
    MetaFormGroup,
    MetaFormGroupComponent,
    ModalService,
    ModalStep,
    ModalStepperComponent
} from '@algonomia/angular-sdk';
import {ValuesFetcherService} from '../../values/fetchers/values-fetcher.service';
import {NgTemplateOutlet} from '@angular/common';

enum StepRate {
    Rate,
    Done
}

@Component({
    selector: 'app-rate-modal',
    imports: [
        MetaFormGroupComponent,
        ButtonContinueComponent,
        ButtonCancelComponent,
        DoneStepComponent,
        NgTemplateOutlet,
        ButtonGotItComponent,
        ModalStepperComponent
    ],
    templateUrl: './rate-modal.component.html',
    styleUrl: './rate-modal.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateModalComponent implements OnInit, AfterViewInit {
    static open(datumId: IOTCDatumId) {
        const modalService = AppInjector.get(ModalService);
        modalService.open(RateModalComponent, 'small-full-height', {datumId}, undefined, false);
    }

    @ViewChild(ModalStepperComponent) modalStepperComponent!: ModalStepperComponent<StepRate>;
    @ViewChild('done') done!: TemplateRef<unknown>;
    @ViewChild('rate') rate!: TemplateRef<unknown>;
    @ViewChild('gotIt') gotIt!: TemplateRef<unknown>;
    @ViewChild('submit') submit!: TemplateRef<unknown>;

    @Input() datumId!: IOTCDatumId;

    protected __submitRate?: Partial<ISubmitRate>;
    public submitRateFormGroup!: MetaFormGroup;
    public modalSteps: ModalStep<StepRate>[][] = [];

    constructor(
        private _cd: ChangeDetectorRef,
        private _modalService: ModalService,
        private _valuesFetcherService: ValuesFetcherService
    ) {}

    async ngOnInit() {
        this.__submitRate = (await this._valuesFetcherService.getCurrentUserRate(this.datumId)) ?? {};
        this.submitRateFormGroup = MetaFormGroup.createFromValidatorGroup(
            submitRateValidator, this.__submitRate
        );
        this._cd.markForCheck();
    }

    ngAfterViewInit() {
        this.modalSteps = [
            [{
                id: StepRate.Rate,
                templateRef: this.rate,
                buttonsRef: [this.submit],
                ignoreIdx: true,
            }],
            [{
                id: StepRate.Done,
                templateRef: this.done,
                buttonsRef: [this.gotIt],
                ignoreIdx: true,
                headIcon: 'People/Community/LikeSelect',
                headTitle: 'OTCFront.CoreCommon.OTCLovesYou',
            }]
        ];
        this._cd.detectChanges();
    }

    onValidateRate() {
        this._valuesFetcherService.submitRate({
            rate: this.submitRateFormGroup?.value.rate,
            comment: this.submitRateFormGroup?.value.comment,
            id: this.datumId.id,
            type: this.datumId.type,
        });
        this.modalStepperComponent.next();
    }

    closeModal() {
        this._modalService.close();
    }
}
