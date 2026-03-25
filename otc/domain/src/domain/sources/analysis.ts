import {z, ZodType} from 'zod';
import {
    AlgoMultiListValidator,
    AlgoStringValidator,
    CountriesUtils,
    ValidatorGroup
} from '@algonomia/ts-shared';
import {ObligationType, EObligationTypeId} from '../obligation-type/obligation-type';
import {Indicator, EIndicatorId} from '../indicators/interfaces/interfaces';
import {ZIndicatorIdSchema} from '../indicators/interfaces/zod';
import {ZObligationTypeIdSchema} from '../obligation-type/zod';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface ISourceAnalysisSegments {
    jurisdictions: string[] | string;
    obligation_type_ids: EObligationTypeId[] | EObligationTypeId;
}

export interface ISourceAnalysisIndicators {
    indicator_ids: EIndicatorId[] | EIndicatorId;
}

export interface ISourceAnalysisComment {
    comment: string;
}

export type TSourceAnalysisParams = ISourceAnalysisSegments & ISourceAnalysisIndicators & ISourceAnalysisComment;

export interface ISourceAnalysisParamsExt {
    jurisdictions: string[];
    obligation_types: ObligationType[];
    indicators: Indicator[];
    comment: string;
}

// ── Zod Schema ──────────────────────────────────────────────────────────────────

export const ZSourcesAnalysisParamsSchema: ZodType<TSourceAnalysisParams> = z.object({
    jurisdictions: z.string().or(z.array(z.string())),
    obligation_type_ids: ZObligationTypeIdSchema.or(z.array(ZObligationTypeIdSchema)),
    indicator_ids: ZIndicatorIdSchema.or(z.array(ZIndicatorIdSchema)),
    comment: z.string()
});

// ── Validators ──────────────────────────────────────────────────────────────────

export const sourceAnalysisSegmentValidator = new ValidatorGroup<ISourceAnalysisSegments>({
    jurisdictions: new AlgoMultiListValidator({
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectConcernedJurisdiction',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectJurisdiction',
        required: true,
        list: CountriesUtils.iso2List,
        isCountryIso: true,
        translate: true
    }),
    obligation_type_ids: new AlgoMultiListValidator({
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectConcernedObligation',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectObligation',
        required: true,
        list: ObligationType.getAllMains().map(x => x.id as EObligationTypeId),
        textCallback: (x => ObligationType.getText(x)),
        translate: true
    })
});

export const sourceAnalysisIndicatorsValidator = new ValidatorGroup<ISourceAnalysisIndicators>({
    indicator_ids: new AlgoMultiListValidator({
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.RecommendedIndicators',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectIndicators',
        required: true,
        list: Indicator.getAllAvailables().map(x => x.id as EIndicatorId),
        textCallback: (x => Indicator.getText(x)),
        translate: true
    })
});

export const sourceAnalysisCommentValidator = new ValidatorGroup<ISourceAnalysisComment>({
    comment: new AlgoStringValidator({
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.UrlSource.Comment',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.UrlSource.CommentPlaceholder'
    })
});

export const sourceAnalysisParamsValidator = ValidatorGroup.createFromValidatorGroup<TSourceAnalysisParams>(
    sourceAnalysisSegmentValidator, sourceAnalysisIndicatorsValidator, sourceAnalysisCommentValidator
)
