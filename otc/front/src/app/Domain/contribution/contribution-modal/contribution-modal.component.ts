import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {SourceFetcherService} from '../../sources/fetchers/source-fetcher.service';
import {
    get_multi_value_common_segment_validator, get_source_validator,
    get_value_validator,
    EIndicatorId, TOTCCreateDatum, TSourceViewExt,
    EObligationTypeId
} from '@otc/domain';
import {AppInjector} from '../../../injector';
import {TranslatePipe} from '@ngx-translate/core';
import {FormArray, FormBuilder} from '@angular/forms';
import {
    ATemplateComponent,
    ButtonCancelComponent,
    ButtonContinueComponent,
    ButtonGotItComponent,
    DoneStepComponent,
    MetaFormControl,
    MetaFormControlComponent,
    MetaFormGroup,
    MetaFormGroupComponent,
    ModalQuitConfirmComponent,
    ModalService,
    ModalStep,
    ModalStepperComponent,
    ToggleComponent
} from '@algonomia/angular-sdk';
import {NgTemplateOutlet} from '@angular/common';
import {IOTCValue} from '@otc/domain';
import {ValuesFetcherService} from '../../values/fetchers/values-fetcher.service';
import {ListMeta} from '@algonomia/ts-shared';

enum ContributionSteps {
    ChoiceSource,
    ChoiceSegmentation,
    ChoiceValues,
    Done
}

@Component({
    selector: 'app-contribution-modal',
    imports: [
        ModalStepperComponent,
        MetaFormGroupComponent,
        TranslatePipe,
        NgTemplateOutlet,
        ButtonContinueComponent,
        ButtonCancelComponent,
        ButtonGotItComponent,
        DoneStepComponent,
        MetaFormControlComponent,
        ToggleComponent
    ],
    templateUrl: './contribution-modal.component.html',
    styleUrl: './contribution-modal.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContributionModalComponent extends ATemplateComponent implements OnInit, AfterViewInit {
    static openUnrestrictedContribution() {
        this._open();
    }

    static openFromExistingResponse(
        initialJurisdiction: string, initialObligation: EObligationTypeId, initialIndicator: EIndicatorId,
        initialValue: IOTCValue
    ) {
        this._open({
            initialJurisdiction,
            initialObligation,
            initialIndicators: [initialIndicator],
            initialValues: {[initialIndicator]: initialValue},
            filterSource: true,
            expand_optionals: true
        });
    }

    private static _open(inputs?: {
        initialJurisdiction?: string,
        initialObligation?: EObligationTypeId,
        initialIndicators?: EIndicatorId[],
        initialValues?: {[key in EIndicatorId]?: IOTCValue},
        initialSourceId?: number,
        filterSource?: boolean,
        expand_optionals?: boolean
    }) {
        const modalService = AppInjector.get(ModalService);
        modalService.open(ContributionModalComponent, 'small-full-height', inputs, undefined, false);
    }

    @Input() initialJurisdiction?: string;
    @Input() initialObligation?: EObligationTypeId;
    @Input() initialSourceId?: number;
    @Input() initialIndicators?: EIndicatorId[];
    @Input() initialValues?: {[key in EIndicatorId]: IOTCValue};
    @Input() filterSource = false;
    @Input() expand_optionals: boolean = false;
    @ViewChild('choiceSourceRef') choiceSourceRef!: TemplateRef<unknown>;
    @ViewChild('choiceSegmentationRef') choiceSegmentationRef!: TemplateRef<unknown>;
    @ViewChild('choiceValuesRef') choiceValuesRef!: TemplateRef<unknown>;
    @ViewChild('doneRef') doneRef!: TemplateRef<unknown>;
    @ViewChild('submitSegmentRef') submitSegmentRef!: TemplateRef<unknown>;
    @ViewChild('submitSourceRef') submitSourceRef!: TemplateRef<unknown>;
    @ViewChild('submitValuesRef') submitValuesRef!: TemplateRef<unknown>;
    @ViewChild('gotItRef') gotItRef!: TemplateRef<unknown>;
    @ViewChild('toggleRef') toggleRef!: TemplateRef<unknown>;
    @ViewChild(ModalStepperComponent) modalStepperComponent!: ModalStepperComponent<ContributionSteps>;
    public sourceFormControl!: MetaFormControl<TSourceViewExt | null, ListMeta<TSourceViewExt, number>>;
    public segmentationFormGroup!: MetaFormGroup;
    indicatorFormControls: MetaFormGroup[] = [];
    indicatorFormArray!: FormArray;

    public modalSteps: ModalStep<ContributionSteps>[][] = [];

    constructor(
        private _cd: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _modalService: ModalService,
        private _sourceFetcherService: SourceFetcherService,
        private _valuesFetcherService: ValuesFetcherService
    ) {
        super();
    }

    ngAfterViewInit(): void {
        this.modalSteps = [
            [{
                id: ContributionSteps.ChoiceSource,
                templateRef: this.choiceSourceRef,
                buttonsRef: [this.submitSourceRef],
                headIcon: "Action/Formatting/Edit",
                headTitle: "OTCFront.ContributionModal.SpecifySource",
                subHeadTitle: "OTCFront.ContributionModal.Source"
            }],
            [{
                id: ContributionSteps.ChoiceSegmentation,
                templateRef: this.choiceSegmentationRef,
                buttonsRef: [this.submitSegmentRef],
                headIcon: "Action/Formatting/Edit",
                headTitle: "OTCFront.ContributionModal.SpecifyValue",
                subHeadTitle: "OTCFront.ContributionModal.Segmentation"
            }],
            [{
                id: ContributionSteps.ChoiceValues,
                templateRef: this.choiceValuesRef,
                buttonsRef: [this.submitValuesRef],
                headIcon: "Action/Formatting/Edit",
                headTitle: "OTCFront.ContributionModal.SpecifyValue",
                subHeadTitle: "OTCFront.ContributionModal.Values",
                subHeadRef: this.toggleRef
            }],
            [{
                id: ContributionSteps.Done,
                templateRef: this.doneRef,
                buttonsRef: [this.gotItRef],
                ignoreIdx: true,
                headIcon: "People/Community/LikeSelect",
                headTitle: "OTCFront.CoreCommon.OTCLovesYou",
            }]
        ];
        this._cd.markForCheck();
    }

    async ngOnInit() {
        const sources = await this._sourceFetcherService.fetchComplete();
        const targetSources = this.filterSource ? sources.filter(x => {
            return (!this.initialJurisdiction || x.jurisdictions.includes(this.initialJurisdiction)) &&
                   (!this.initialObligation || x.obligation_types.some(x => x.id == this.initialObligation)) &&
                   (!this.initialIndicators || x.indicators.some(x => this.initialIndicators?.includes(x.id)));
        }) : sources;
        let initialSourceExt = targetSources.find(x => x.source_id === this.initialSourceId);
        if (!initialSourceExt && targetSources.length === 1) {
            initialSourceExt = targetSources[0];
        }
        this.sourceFormControl = new MetaFormControl(get_source_validator(targetSources), initialSourceExt);
        this._cd.markForCheck();
    }

    onValidateSource() {
        const source = this.sourceFormControl.value!;
        this.segmentationFormGroup = MetaFormGroup.createFromValidatorGroup(
            get_multi_value_common_segment_validator(source), {
                jurisdiction: this.initialJurisdiction,
                obligation_type_id: this.initialObligation,
                indicator_ids: this.initialIndicators
            }
        );
        this.modalStepperComponent.next();
        if (this.segmentationFormGroup.valid) {
            this.onValidateSegmentation();
        }
    }

    onValidateSegmentation() {
        this.indicatorFormControls = this.getIndicatorFormControls();
        this.indicatorFormArray = this._formBuilder.array(this.indicatorFormControls);
        this.modalStepperComponent.next();
    }

    getIndicatorFormControls() {
        const selectedIndicatorIds: EIndicatorId[] = this.segmentationFormGroup.value?.indicator_ids ?? [];
        const obligationType: EObligationTypeId = this.segmentationFormGroup.value?.obligation_type_id;
        return selectedIndicatorIds.map(indicatorId => {
            const initialValue = this.initialValues ? (this.initialValues[indicatorId] ?? null) : null;
            return MetaFormGroup.createFromValidatorGroup(get_value_validator(obligationType, indicatorId), {
                value: initialValue?.value,
                additional_values: initialValue?.additional_values ?? undefined,
                notes: initialValue?.notes ?? '',
                reference: initialValue?.reference ?? ''
            });
        });
    }

    onValidateValues() {
        const source_id = this.sourceFormControl.value?.source_id;
        const obligation_type_id = this.segmentationFormGroup.value?.obligation_type_id;
        const jurisdiction = this.segmentationFormGroup.value?.jurisdiction;
        const userValues: TOTCCreateDatum[] = this.segmentationFormGroup.value?.indicator_ids.map((indicator_id: EIndicatorId, i: number) => {
            return {source_id, obligation_type_id, jurisdiction, key: indicator_id, ...this.indicatorFormControls[i].value}
        });
        this._valuesFetcherService.post(userValues);
        this.modalStepperComponent.next();
    }

    closeModal() {
        const hasAtLeastOneValid: boolean = this.segmentationFormGroup
            && Object.values(this.segmentationFormGroup.controls).some(control => control.valid);

        if (this.modalStepperComponent.getIdx() !== ContributionSteps.Done && hasAtLeastOneValid) {
            this.pipeTakeUntil(this._modalService.open(ModalQuitConfirmComponent, 'medium')).subscribe(confirm => {
                if (confirm) this._modalService.close();
            });
        } else {
            this._modalService.close();
        }
    }
}
