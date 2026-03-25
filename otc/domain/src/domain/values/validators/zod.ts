import {z} from 'zod';
import {TOTCCreateDatum, TOTCDatum, IOTCDatumId, TOTCHistorySegment} from '../otc-value';
import {IDatumHistoryView, TDatumFullHistoryView} from '../history-view/history-view';
import {IDatumContributionView, TDatumFullContributionView} from '../contribution/contribution-view';
import {ZObligationTypeIdSchema} from '../../obligation-type/zod';
import {ZIndicatorIdSchema} from '../../indicators/interfaces/zod';
import {ZOrganizationTypeIdSchema} from '../../sources/organization-type/zod';
import {EValuesStatus} from '../values-status';
import {ZFileWithUuid} from '@algonomia/ts-shared';

export const ZOTCDatum: z.ZodType<TOTCDatum> = z.object({
    jurisdiction: z.string(),
    obligation_type_id: ZObligationTypeIdSchema,
    key: ZIndicatorIdSchema,
    id: z.number(),
    type: z.enum(['from_ai', 'from_user']),
    value: z.any(),
    additional_values: z.any(),
    reference: z.string().optional(),
    judge_llm_score: z.number().optional(),
    notes: z.string().optional(),
    version: z.string()
});

export const ZOTCCreateDatum: z.ZodType<TOTCCreateDatum> = z.object({
    source_id: z.number(),
    jurisdiction: z.string(),
    obligation_type_id: ZObligationTypeIdSchema,
    key: ZIndicatorIdSchema,
    value: z.any(),
    additional_values: z.any(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export const ZOTCValueHistorySegment: z.ZodType<TOTCHistorySegment> = z.object({
    jurisdiction: z.string(),
    obligation_type_id: ZObligationTypeIdSchema,
    key: ZIndicatorIdSchema
});

export const ZOTCDatumId: z.ZodType<IOTCDatumId> = z.object({
    type: z.enum(['from_ai', 'from_user']),
    id: z.number(),
});

const _ZSourceKeyInfoPartial = z.object({
    source_id: z.number(),
    source_name: z.string(),
    organization: z.string(),
    organization_type_id: ZOrganizationTypeIdSchema,
    link: z.string().optional(),
    files: z.array(ZFileWithUuid).optional(),
    date_of_publication: z.number().optional(),
}).partial();

export const ZDatumHistoryView: z.ZodType<IDatumHistoryView> = z.object({
    type: z.enum(['from_ai', 'from_user']),
    id: z.number(),
    source_id: z.number(),
    jurisdiction: z.string().length(2),
    obligation_type_id: ZObligationTypeIdSchema,
    version: z.string(),
    key: ZIndicatorIdSchema,
    value: z.any(),
    additional_values: z.any().optional(),
    notes: z.string(),
    judge_llm_score: z.number().optional(),
    reference: z.string(),
    proposed_by: z.string(),
    average_rate: z.number().nullable(),
    current_user_rate: z.number().nullable(),
    current_user_comment: z.string(),
});

export const ZDatumFullHistoryView: z.ZodType<TDatumFullHistoryView> = ZDatumHistoryView.and(_ZSourceKeyInfoPartial);

export const ZDatumContributionView: z.ZodType<IDatumContributionView> = z.object({
    id: z.number(),
    source_id: z.number(),
    jurisdiction: z.string().length(2),
    obligation_type_id: ZObligationTypeIdSchema,
    version: z.string(),
    key: ZIndicatorIdSchema,
    value: z.any(),
    additional_values: z.any(),
    notes: z.string(),
    reference: z.string(),
    proposed_by: z.string(),
    status: z.nativeEnum(EValuesStatus),
    admin_comment: z.string(),
});

export const ZDatumFullContributionView: z.ZodType<TDatumFullContributionView> = ZDatumContributionView.and(_ZSourceKeyInfoPartial);
