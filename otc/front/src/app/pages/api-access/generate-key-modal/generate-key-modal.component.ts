import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    ATemplateComponent,
    ButtonCancelComponent,
    ButtonContinueComponent,
    ClipboardFieldComponent,
    MetaFormGroup,
    MetaFormGroupComponent,
    ModalService,
    ModalStep,
    ModalStepperComponent
} from '@algonomia/angular-sdk';
import {createAccessKeyValidatorGroup} from '@otc/domain';
import {AccessTokenFetcherService} from '../../../Domain/access-token/access-token-fetcher.service';
import {IFrontApiAccessPublicInfoAndSecret, TUser} from '@otc/domain';
import {TranslatePipe} from '@ngx-translate/core';

enum StepGenerateKey {
    Creation,
    Clipboard
}

@Component({
    selector: 'app-generate-key-modal',
    templateUrl: './generate-key-modal.component.html',
    styleUrls: ['./generate-key-modal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MetaFormGroupComponent,
        ButtonCancelComponent,
        ModalStepperComponent,
        ButtonContinueComponent,
        ClipboardFieldComponent,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateKeyModalComponent extends ATemplateComponent implements OnInit, AfterViewInit {
    @ViewChild(ModalStepperComponent) modalStepperComponent!: ModalStepperComponent<StepGenerateKey>;
    @ViewChild('creation') creation!: TemplateRef<unknown>;
    @ViewChild('clipboard') clipboard!: TemplateRef<unknown>;
    @ViewChild('submitCreation') submitCreation!: TemplateRef<unknown>;
    @ViewChild('closeBtn') closeBtn!: TemplateRef<unknown>;

    public generateKeyForm!: MetaFormGroup;
    public modalSteps: ModalStep<StepGenerateKey>[][] = [];
    public clipboard_data?: IFrontApiAccessPublicInfoAndSecret;

    constructor(
        private _cd: ChangeDetectorRef,
        private _modalService: ModalService,
        private _tokenService: AccessTokenFetcherService,
    ) {
        super();
    }

    ngOnInit() {
        this.generateKeyForm = MetaFormGroup.createFromValidatorGroup(createAccessKeyValidatorGroup, {});
        this._cd.markForCheck();
    }

    ngAfterViewInit(): void {
        const head_icon = "System/Class/Key";
        const head_title = "OTCFront.Api.GenerateKey";

        this.modalSteps = [
            [{
                id: StepGenerateKey.Creation,
                templateRef: this.creation,
                buttonsRef: [this.submitCreation],
                headIcon: head_icon,
                headTitle: head_title,
            }],
            [{
                id: StepGenerateKey.Clipboard,
                templateRef: this.clipboard,
                buttonsRef: [this.closeBtn],
                headIcon: head_icon,
                headTitle: head_title,
                ignoreIdx: true
            }]
        ];
        this._cd.detectChanges();
    }

    public onSubmit() {
        const expires_at: Date = this.generateKeyForm.value.expires_at;

        if (!expires_at) {
            return;
        }

        this._tokenService.createToken(expires_at).then((data: IFrontApiAccessPublicInfoAndSecret) => {
            this.clipboard_data = data;
            this.modalStepperComponent.next();
        });
    }

    public closeModal() {
        this._modalService.close();
    }
}
