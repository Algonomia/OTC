import {
    AEnhancedEnumFactory,
    AlgoComplexValueValidator,
    AlgoMonoListValidator,
    AlgoMultiListValidator,
    AlgoStringValidator, ArrayUtils,
    AValidator, BaseMeta, ComplexValueMeta,
    EBaseTypes, TComplexValue,
    LanguagesUtils, ListMeta, StringMeta
} from '@algonomia/ts-shared';
import {IsObligationInPlace, EIsObligationInPlaceId} from '../enums/is-obligation-in-place/is-obligation-in-place';
import {ScopeOfObligation, EScopeOfObligationId} from '../enums/scope-of-obligation/scope-of-obligation';
import {FilingResponsibility, EFilingResponsibilityId} from '../enums/filing-responsibility/filing-responsibility';
import {ApplicableEntityType, EApplicableEntityTypeId} from '../enums/applicable-entity-types/applicable-entity-types';
import {SubmissionMethod, ESubmissionMethodId} from '../enums/submission-method/submission-method';
import {EnglishAccepted, EEnglishAcceptedId} from '../enums/english-accepted/english-accepted';
import {OTCTagUtils} from '../../tags/otc-tag-list';
import {ObligationType, EObligationTypeId} from '../../obligation-type/obligation-type';

export type TAiProcessingGroup = 'Overview' | 'Deadline' | 'Threshold' | 'Penalty';

export enum EIndicatorId {
    IsObligationInPlace = 'IsObligationInPlace',
    ScopeOfObligation = 'ScopeOfObligation',
    FilingResponsibility = 'FilingResponsibility',
    ParentFilingExemption = 'ParentFilingExemption',
    ApplicableEntityTypes = 'ApplicableEntityTypes',
    SubmissionMethod = 'SubmissionMethod',
    SubmissionURL = 'SubmissionURL',
    LocalLanguage = 'LocalLanguage',
    EnglishAccepted = 'EnglishAccepted',
    Penalty = 'Penalty',
    ThresholdPreparation = 'ThresholdPreparation',
    ThresholdFiling = 'ThresholdFiling',
    DeadlineFiling = 'DeadlineFiling',
    DeadlinePreparation = 'DeadlinePreparation',
    DeadlineExtension = 'DeadlineExtension'
}

type _TValidatorFactory<T, M extends BaseMeta> = new (config: M) => AValidator<T, M>;

export class Indicator<T = any, M extends BaseMeta = BaseMeta> extends AEnhancedEnumFactory {
    static is_obligation_in_place = new Indicator<EIsObligationInPlaceId, ListMeta<EIsObligationInPlaceId>>(
        EIndicatorId.IsObligationInPlace,
        'Overview',
        'ObligationDueDateDomain.Indicator.IsObligationInPlace.text',
        'ObligationDueDateDomain.Indicator.IsObligationInPlace.notes',
        'ObligationDueDateDomain.Indicator.IsObligationInPlace.refs',
        'ObligationDueDateDomain.Indicator.IsObligationInPlace.info',
        AlgoMonoListValidator,
        {
            list: IsObligationInPlace.getAllIds(),
            textCallback: (x: EIsObligationInPlaceId) => IsObligationInPlace.getText(x),
            translate: true
        }
    );
    static scope_of_obligation = new Indicator<EScopeOfObligationId, ListMeta<EScopeOfObligationId>>(
        EIndicatorId.ScopeOfObligation,
        'Overview',
        'ObligationDueDateDomain.Indicator.ScopeOfObligation.text',
        'ObligationDueDateDomain.Indicator.ScopeOfObligation.notes',
        'ObligationDueDateDomain.Indicator.ScopeOfObligation.refs',
        'ObligationDueDateDomain.Indicator.ScopeOfObligation.info',
        AlgoMonoListValidator,
        {
            list: ScopeOfObligation.getAllIds(),
            textCallback: (x: EScopeOfObligationId) => ScopeOfObligation.getText(x),
            translate: true
        }
    );
    static filing_responsibility = new Indicator<EFilingResponsibilityId, ListMeta<EFilingResponsibilityId>>(
        EIndicatorId.FilingResponsibility,
        'Overview',
        'ObligationDueDateDomain.Indicator.FilingResponsibility.text',
        'ObligationDueDateDomain.Indicator.FilingResponsibility.notes',
        'ObligationDueDateDomain.Indicator.FilingResponsibility.refs',
        'ObligationDueDateDomain.Indicator.FilingResponsibility.info',
        AlgoMonoListValidator,
        {
            list: FilingResponsibility.getAllIds(),
            textCallback: (x: EFilingResponsibilityId) => FilingResponsibility.getText(x),
            translate: true
        }
    );
    static parent_filing_exemption = new Indicator<boolean, ListMeta<boolean>>(
        EIndicatorId.ParentFilingExemption,
        'Overview',
        'ObligationDueDateDomain.Indicator.ParentFilingExemption.text',
        'ObligationDueDateDomain.Indicator.ParentFilingExemption.notes',
        'ObligationDueDateDomain.Indicator.ParentFilingExemption.refs',
        'ObligationDueDateDomain.Indicator.ParentFilingExemption.info',
        AlgoMonoListValidator,
        {
            list: [true, false],
            textCallback: (x: boolean) => x ? 'OTCFront.CoreCommon.Yes' : 'OTCFront.CoreCommon.No',
            translate: true
        }
    );
    static applicable_entity_types = new Indicator<EApplicableEntityTypeId, ListMeta<EApplicableEntityTypeId>>(
        EIndicatorId.ApplicableEntityTypes,
        'Overview',
        'ObligationDueDateDomain.Indicator.ApplicableEntityTypes.text',
        'ObligationDueDateDomain.Indicator.ApplicableEntityTypes.notes',
        'ObligationDueDateDomain.Indicator.ApplicableEntityTypes.refs',
        'ObligationDueDateDomain.Indicator.ApplicableEntityTypes.info',
        AlgoMultiListValidator,
        {
            list: ApplicableEntityType.getAllIds(),
            textCallback: (x: EApplicableEntityTypeId) => ApplicableEntityType.getText(x),
            translate: true
        }
    );
    static submission_methods = new Indicator<ESubmissionMethodId, ListMeta<ESubmissionMethodId>>(
        EIndicatorId.SubmissionMethod,
        'Overview',
        'ObligationDueDateDomain.Indicator.SubmissionMethods.text',
        'ObligationDueDateDomain.Indicator.SubmissionMethods.notes',
        'ObligationDueDateDomain.Indicator.SubmissionMethods.refs',
        'ObligationDueDateDomain.Indicator.SubmissionMethods.info',
        AlgoMultiListValidator,
        {
            list: SubmissionMethod.getAllIds(),
            textCallback: (x: ESubmissionMethodId) => SubmissionMethod.getText(x),
            translate: true
        }
    );
    static submission_url = new Indicator<string, StringMeta>(
        EIndicatorId.SubmissionURL,
        'Overview',
        'ObligationDueDateDomain.Indicator.SubmissionURL.text',
        'ObligationDueDateDomain.Indicator.SubmissionURL.notes',
        'ObligationDueDateDomain.Indicator.SubmissionURL.refs',
        'ObligationDueDateDomain.Indicator.SubmissionURL.info',
        AlgoStringValidator,
        {
            isUrl: true
        }
    );
    static local_language = new Indicator<string, ListMeta<string>>(
        EIndicatorId.LocalLanguage,
        'Overview',
        'ObligationDueDateDomain.Indicator.LocalLanguage.text',
        'ObligationDueDateDomain.Indicator.LocalLanguage.notes',
        'ObligationDueDateDomain.Indicator.LocalLanguage.refs',
        'ObligationDueDateDomain.Indicator.LocalLanguage.info',
        AlgoMultiListValidator,
        {
            list: LanguagesUtils.getAllLanguages(),
            textCallback: (x: string) => LanguagesUtils.getLanguageName(x),
            translate: true,
            isLang: true
        }
    );
    static english_accepted = new Indicator<EEnglishAcceptedId, ListMeta<EEnglishAcceptedId>>(
        EIndicatorId.EnglishAccepted,
        'Overview',
        'ObligationDueDateDomain.Indicator.EnglishAccepted.text',
        'ObligationDueDateDomain.Indicator.EnglishAccepted.notes',
        'ObligationDueDateDomain.Indicator.EnglishAccepted.refs',
        'ObligationDueDateDomain.Indicator.EnglishAccepted.info',
        AlgoMonoListValidator,
        {
            list: EnglishAccepted.getAllIds(),
            textCallback: (x: EEnglishAcceptedId) => EnglishAccepted.getText(x),
            translate: true
        }
    );
    static penalty = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.Penalty,
        'Penalty',
        'ObligationDueDateDomain.Indicator.Penalty.text',
        'ObligationDueDateDomain.Indicator.Penalty.notes',
        'ObligationDueDateDomain.Indicator.Penalty.refs',
        'ObligationDueDateDomain.Indicator.Penalty.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getThresholdPenaltyOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.Numeric
        }
    );
    static threshold_preparation = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.ThresholdPreparation,
        'Threshold',
        'ObligationDueDateDomain.Indicator.ThresholdPreparation.text',
        'ObligationDueDateDomain.Indicator.ThresholdPreparation.notes',
        'ObligationDueDateDomain.Indicator.ThresholdPreparation.refs',
        'ObligationDueDateDomain.Indicator.ThresholdPreparation.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getThresholdPenaltyOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.String
        }
    );
    static threshold_filing = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.ThresholdFiling,
        'Threshold',
        'ObligationDueDateDomain.Indicator.ThresholdFiling.text',
        'ObligationDueDateDomain.Indicator.ThresholdFiling.notes',
        'ObligationDueDateDomain.Indicator.ThresholdFiling.refs',
        'ObligationDueDateDomain.Indicator.ThresholdFiling.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getThresholdPenaltyOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.String
        }
    );
    static deadline_filing = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.DeadlineFiling,
        'Deadline',
        'ObligationDueDateDomain.Indicator.DeadlineFiling.text',
        'ObligationDueDateDomain.Indicator.DeadlineFiling.notes',
        'ObligationDueDateDomain.Indicator.DeadlineFiling.refs',
        'ObligationDueDateDomain.Indicator.DeadlineFiling.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getDeadlineOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.Date
        }
    );
    static deadline_preparation = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.DeadlinePreparation,
        'Deadline',
        'ObligationDueDateDomain.Indicator.DeadlinePreparation.text',
        'ObligationDueDateDomain.Indicator.DeadlinePreparation.notes',
        'ObligationDueDateDomain.Indicator.DeadlinePreparation.refs',
        'ObligationDueDateDomain.Indicator.DeadlinePreparation.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getDeadlineOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.Date
        }
    );
    static deadline_extension = new Indicator<TComplexValue, ComplexValueMeta>(
        EIndicatorId.DeadlineExtension,
        'Deadline',
        'ObligationDueDateDomain.Indicator.DeadlineExtension.text',
        'ObligationDueDateDomain.Indicator.DeadlineExtension.notes',
        'ObligationDueDateDomain.Indicator.DeadlineExtension.refs',
        'ObligationDueDateDomain.Indicator.DeadlineExtension.info',
        AlgoComplexValueValidator,
        {
            tag_list: OTCTagUtils.getDeadlineOTCTags(),
            scope_list: OTCTagUtils.getOTCScopes(),
            expected_output: EBaseTypes.Period
        }
    );

    static getText(id: EIndicatorId): string {
        return (this.getByIdOrId(id) as Indicator | undefined)?.text ?? id;
    }

    static getNotesText(id: EIndicatorId): string {
        return (this.getByIdOrId(id) as Indicator | undefined)?.notes_text ?? id;
    }

    static getRefsText(id: EIndicatorId): string {
        return (this.getByIdOrId(id) as Indicator | undefined)?.refs_text ?? id;
    }

    static getInfo(id: EIndicatorId): string {
        return (this.getByIdOrId(id) as Indicator | undefined)?.info ?? id;
    }

    static resolveIndicatorsByAiProcessingGroup(indicators: EIndicatorId[]) {
        const aiProcessingGroup = Indicator.getIndicatorsPerAiProcessingGroup();
        const indicatorsSet = new Set(indicators as EIndicatorId[]);
        const groups = Object.keys(aiProcessingGroup) as TAiProcessingGroup[];
        
        return groups.map(group => ({
            name: group,
            indicators: aiProcessingGroup[group].filter(indicator => indicatorsSet.has(indicator))
        }));
    }

    static getIndicatorsPerAiProcessingGroup(): Record<TAiProcessingGroup, EIndicatorId[]> {
        const allIndicators: Indicator[] = this.getAllAvailables() as Indicator[];
        const indicatorsPerGroup: Record<TAiProcessingGroup, EIndicatorId[]> = {
            Overview: [],
            Deadline: [],
            Threshold: [],
            Penalty: []
        };
        allIndicators.forEach(x => {
            indicatorsPerGroup[x.ai_processing_group].push(x.__id);
        });
        return indicatorsPerGroup;
    }

    private constructor(
        protected __id: EIndicatorId,
        readonly ai_processing_group: TAiProcessingGroup,
        readonly text: string = __id,
        readonly notes_text: string = text,
        readonly refs_text: string = text,
        readonly info: string = '',
        readonly validatorType: _TValidatorFactory<T, M>,
        readonly validatorConfig: Omit<M, 'label' | 'required'>
    ) {
        super(__id);
    }

    get id(): EIndicatorId {
        return this.__id;
    }

    get validator() {
        return new this.validatorType({
            ...this.validatorConfig, label: this.text, required: true
        } as M);
    }

    getSubObligationValidator(subObligation: EObligationTypeId) {
        const obligationText = ObligationType.getText(subObligation);
        return new this.validatorType({
            ...this.validatorConfig, label: obligationText, required: false
        } as M);
    }
}
