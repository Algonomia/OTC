import {z, ZodType} from 'zod';
import {AlgoStringValidator, ValidatorGroup} from '@algonomia/ts-shared';
import {sourceAnalysisCommentValidator, ISourceAnalysisComment} from '../analysis';
import {
    TCreateSources,
    THTTPCreateSources,
    ZHttpCreateSourcesSchema
} from './common';
import {httpSourceProvenanceValidator} from '../provenance';

// ── Interface & Zod ─────────────────────────────────────────────────────────────

export interface ILinkSourceParams {
    link: string;
}

export const ZLinkSourceParamSchema = z.object({
    link: z.string()
});

// ── Validators ──────────────────────────────────────────────────────────────────

export const sourceLinkParamsValidator = new ValidatorGroup<ILinkSourceParams>({
    link: new AlgoStringValidator({
        required: true,
        isUrl: true,
        label: 'ObligationDueDateDomain.SourcesFromLink.UrlSource.Url',
        placeholder: 'www.mynewsource.com'
    })
});

export const sourceLinkAndCommentValidator = ValidatorGroup.createFromValidatorGroup<ILinkSourceParams & ISourceAnalysisComment>(
    sourceLinkParamsValidator, sourceAnalysisCommentValidator
);

// ── Composed Types ──────────────────────────────────────────────────────────────

export type TCreateLinkSources = TCreateSources & ILinkSourceParams;
export type THTTPCreateLinkSources = THTTPCreateSources & ILinkSourceParams;

export const ZCreateLinkSourcesSchema: ZodType<THTTPCreateLinkSources> = ZHttpCreateSourcesSchema.and(ZLinkSourceParamSchema);
export const sourceLinkCreateValidator = ValidatorGroup.createFromValidatorGroup<THTTPCreateLinkSources>(httpSourceProvenanceValidator, sourceLinkParamsValidator)
