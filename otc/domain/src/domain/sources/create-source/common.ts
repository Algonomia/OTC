import {z} from 'zod';
import {TSourceAnalysisParams} from '../analysis';
import {ZHTTPSourceProvenanceSchema, ICreateSourceProvenance, IHTTPSourceProvenance} from '../provenance';
import {ZSourcesAnalysisParamsSchema} from '../analysis';

export type TCreateSources = ICreateSourceProvenance & TSourceAnalysisParams;
export type THTTPCreateSources = IHTTPSourceProvenance & TSourceAnalysisParams;

export const ZHttpCreateSourcesSchema: z.ZodType<THTTPCreateSources> = ZHTTPSourceProvenanceSchema.and(ZSourcesAnalysisParamsSchema);

