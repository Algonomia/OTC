import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {ChoiceSourceComponent} from './step/choice-source/choice-source.component';
import {ReactiveFormsModule} from '@angular/forms';
import {
    TCreateFileSources,
    sourceAnalysisIndicatorsValidator, sourceAnalysisSegmentValidator,
    sourceBrowserFileAndCommentValidator, sourceLinkAndCommentValidator,
    sourceProvenanceValidator
} from '@otc/domain';
import {
    ATemplateComponent,
    ButtonCancelComponent,
    ButtonContinueComponent,
    ButtonGotItComponent,
    DoneStepComponent,
    MetaFormGroup,
    MetaFormGroupComponent,
    ModalQuitConfirmComponent,
    ModalService,
    ModalStep,
    ModalStepperComponent
} from '@algonomia/angular-sdk';
import {AppInjector} from '../../../injector';
import {SourceFetcherService} from '../fetchers/source-fetcher.service';

enum StepNewSource {
    NameSource,
    ChoiceSource,
    AddSource,
    ObligationConfig,
    AddValue,
    Done
}

export type SourceChoice = 'url' | 'file';

@Component({
    selector: 'app-source-modal',
    templateUrl: './source-modal.component.html',
    styleUrl: './source-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        ChoiceSourceComponent,
        DoneStepComponent,
        ModalStepperComponent,
        ButtonCancelComponent,
        ReactiveFormsModule,
        ButtonContinueComponent,
        ButtonGotItComponent,
        MetaFormGroupComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceModalComponent extends ATemplateComponent implements OnInit, AfterViewInit {
    static open() {
        const modalService = AppInjector.get(ModalService);
        modalService.open(SourceModalComponent, 'small-full-height', {}, undefined, false);
    }

    @ViewChild('nameSource') nameSource!: TemplateRef<unknown>;
    @ViewChild('choiceSource') choiceSource!: TemplateRef<unknown>;
    @ViewChild('addSource') addSource!: TemplateRef<unknown>;
    @ViewChild('obligationConfig') obligationConfig!: TemplateRef<unknown>;
    @ViewChild('addValue') addValue!: TemplateRef<unknown>;
    @ViewChild('done') done!: TemplateRef<unknown>;
    @ViewChild('closeBtn') closeBtn!: TemplateRef<unknown>;
    @ViewChild('submitName') submitName!: TemplateRef<unknown>;
    @ViewChild('submitUrlFile') submitUrlFile!: TemplateRef<unknown>;
    @ViewChild('submitObligations') submitObligations!: TemplateRef<unknown>;
    @ViewChild('submitValues') submitValues!: TemplateRef<unknown>;
    @ViewChild('gotIt') gotIt!: TemplateRef<unknown>;
    @ViewChild(ModalStepperComponent) modalStepperComponent!: ModalStepperComponent<StepNewSource>;

    public modalSteps: ModalStep<StepNewSource>[][] = [];
    public current_source_type!: SourceChoice;

    public sourceProvenanceFormGroup!: MetaFormGroup;
    public obligationJurisdictionFormGroup!: MetaFormGroup;
    public indicatorsFormGroup!: MetaFormGroup;
    public urlFormGroup!: MetaFormGroup;
    public filesFormGroup!: MetaFormGroup;

    constructor(
        private _cd: ChangeDetectorRef,
        private _modalService: ModalService,
        private _sourceFetcherService: SourceFetcherService
    ) {
        super();
    }

    ngOnInit() {
        this.sourceProvenanceFormGroup = MetaFormGroup.createFromValidatorGroup(sourceProvenanceValidator, {});
        this.indicatorsFormGroup = MetaFormGroup.createFromValidatorGroup(sourceAnalysisIndicatorsValidator, {indicator_ids: []});
        this.obligationJurisdictionFormGroup = MetaFormGroup.createFromValidatorGroup(sourceAnalysisSegmentValidator, {});
        this.urlFormGroup = MetaFormGroup.createFromValidatorGroup(sourceLinkAndCommentValidator, {comment: ''});
        this.filesFormGroup = MetaFormGroup.createFromValidatorGroup(sourceBrowserFileAndCommentValidator, {files: [], comment: ''});

        this._cd.markForCheck();
    }

    ngAfterViewInit(): void {
        const head_icon = "Action/Navigation/Add";
        const head_title = "OTCFront.Sources.AddNewSource";

        this.modalSteps = [
            [{
                id: StepNewSource.NameSource,
                templateRef: this.nameSource,
                buttonsRef: [this.submitName],
                headIcon: head_icon,
                headTitle: head_title,
            }],
            [{
                id: StepNewSource.ChoiceSource,
                templateRef: this.choiceSource,
                buttonsRef: [this.closeBtn],
                headIcon: head_icon,
                headTitle: head_title,
            }],
            [
               new AddSourceStepDelegate(this.addSource, [this.submitUrlFile], () => this.current_source_type)
            ],
            [{
                id: StepNewSource.ObligationConfig,
                templateRef: this.obligationConfig,
                buttonsRef: [this.submitObligations],
                headIcon: head_icon,
                headTitle: head_title,
            }],
            [{
                id: StepNewSource.AddValue,
                templateRef: this.addValue,
                buttonsRef: [this.submitValues],
                headIcon: head_icon,
                headTitle: head_title,
            }],
            [{
                id: StepNewSource.Done,
                templateRef: this.done,
                buttonsRef: [this.gotIt],
                ignoreIdx: true,
                headIcon: 'People/Community/LikeSelect',
                headTitle: 'OTCFront.CoreCommon.OTCLovesYou',
            }]
        ];
        this._cd.detectChanges();
    }

    closeModal() {
        const hasAtLeastOneValid: boolean = Object.values(this.sourceProvenanceFormGroup.controls)
            .some(control => control.valid);

        if (this.modalStepperComponent.getIdx() !== StepNewSource.Done && hasAtLeastOneValid) {
            this.pipeTakeUntil(this._modalService.open(ModalQuitConfirmComponent, 'medium')).subscribe(confirm => {
                if (confirm) this._modalService.close();
            });
        } else {
            this._modalService.close();
        }
    }

    choiceTypeSource(type: SourceChoice) {
        this.current_source_type = type;
        this.modalStepperComponent.next();
        this._cd.markForCheck();
    }

    onSubmitUrl() {
        if (this.urlFormGroup.valid) {
            this.modalStepperComponent.next();
        }
    }

    onSubmitFile() {
        if (this.filesFormGroup.valid) {
            this.modalStepperComponent.next();
            this._cd.markForCheck();
        }
    }

    nextStepper() {
        this.modalStepperComponent.next();
    }

    submit() {
        if (this.current_source_type === 'url') {
            this.createLinkSource();
        } else {
            this.createFileSource();
        }
        this.modalStepperComponent.next();
    }

    createLinkSource() {
        const source = {
            source_name: this.sourceProvenanceFormGroup.value.source_name as string,
            organization: this.sourceProvenanceFormGroup.value.organization as string,
            organization_type_id: this.sourceProvenanceFormGroup.value.organization_type_id,
            date_of_publication: this.sourceProvenanceFormGroup.value.date_of_publication,
            jurisdictions: this.obligationJurisdictionFormGroup.value.jurisdictions,
            obligation_type_ids: this.obligationJurisdictionFormGroup.value.obligation_type_ids,
            indicator_ids: this.indicatorsFormGroup.value.indicator_ids,
            link: this.urlFormGroup.value.link as string,
            comment: this.urlFormGroup.value.comment as string
        };
        this._sourceFetcherService.createLinkSource(source)
    }

    createFileSource() {
        const source = {
            source_name: this.sourceProvenanceFormGroup.value.source_name,
            organization: this.sourceProvenanceFormGroup.value.organization,
            organization_type_id: this.sourceProvenanceFormGroup.value.organization_type_id,
            date_of_publication: this.sourceProvenanceFormGroup.value.date_of_publication,
            jurisdictions: this.obligationJurisdictionFormGroup.value.jurisdictions,
            obligation_type_ids: this.obligationJurisdictionFormGroup.value.obligation_type_ids,
            indicator_ids: this.indicatorsFormGroup.value.indicator_ids,
            files: this.filesFormGroup.value.files,
            comment: this.filesFormGroup.value.comment
        } as TCreateFileSources;
        this._sourceFetcherService.createFileSource(source);
    }
}

class AddSourceStepDelegate {
    readonly id = StepNewSource.AddSource;
    readonly headTitle: string = "OTCFront.Sources.AddNewSource";

    constructor(
        readonly templateRef: TemplateRef<any>,
        readonly buttonsRef: TemplateRef<any>[] = [],
        readonly getSourceType: () => 'url' | 'file'
    ) {}

    get headIcon() {
        return this.getSourceType() === 'url' ? 'People/Community/Link' : 'System/Storage/CloudAdd';
    }
}
