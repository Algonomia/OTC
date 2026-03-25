import {z, ZodType} from 'zod';
import {
    AlgoBrowserFileValidator,
    AlgoMulterFileValidator,
    FileExtensions, FileMeta,
    ValidatorGroup
} from '@algonomia/ts-shared';
import {sourceAnalysisCommentValidator, ISourceAnalysisComment} from '../analysis';
import {
    TCreateSources,
    THTTPCreateSources,
    ZHttpCreateSourcesSchema
} from './common';

// ── Interface & Zod ─────────────────────────────────────────────────────────────

export interface IFileSourceParams {
    files: File[];
}

export const ZFileSourceParams: ZodType<IFileSourceParams> = z.object({
    files: z.array(z.instanceof(File))
})

// ── Validators ──────────────────────────────────────────────────────────────────

const _sourceFileValidatorMeta: FileMeta = {
    required: true,
    maxSize: 1,
    maxSizeUnit: 'GB',
    extensions: FileExtensions.getDocExtensionIds(),
};

export const sourceBrowserFileValidator = new ValidatorGroup<IFileSourceParams>({
    files: new AlgoBrowserFileValidator(_sourceFileValidatorMeta)
});

export const sourceBrowserFileAndCommentValidator = ValidatorGroup.createFromValidatorGroup<IFileSourceParams & ISourceAnalysisComment>(
    sourceBrowserFileValidator, sourceAnalysisCommentValidator
);

export const sourceMulterFileValidator = new AlgoMulterFileValidator(_sourceFileValidatorMeta);

// ── Composed Types ──────────────────────────────────────────────────────────────

export type TCreateFileSources = TCreateSources & IFileSourceParams;
export type THTTPCreateFileSources = THTTPCreateSources & IFileSourceParams;

export const ZCreateFileSourcesSchema: ZodType<THTTPCreateFileSources> = ZHttpCreateSourcesSchema.and(ZFileSourceParams);
