import {z} from 'zod';
import {ZOrganizationTypeIdSchema} from '../organization-type/zod';
import {ZObligationTypeIdSchema} from '../../obligation-type/zod';
import {ZIndicatorIdSchema} from '../../indicators/interfaces/zod';
import {ZSourceStatusSchema} from '../status/zod';
import {ZSourceTypeSchema} from '../create-source/source-type';

export const ZSourceViewSchema = z.object({
    source_id: z.number(),
    source_name: z.string(),
    organization: z.string(),
    organization_type_id: ZOrganizationTypeIdSchema,
    date_of_publication: z.number().optional(),
    jurisdictions: z.array(z.string()),
    obligation_type_ids: z.array(ZObligationTypeIdSchema),
    indicator_ids: z.array(ZIndicatorIdSchema),
    status_id: ZSourceStatusSchema,
    proposed_by: z.string(),
    proposed_at: z.number(),
    validated_by: z.string().optional(),
    validated_at: z.number().optional(),
    source_type: ZSourceTypeSchema,
    link: z.string().optional(),
    comment: z.string(),
    admin_comment: z.string().optional(),
    files: z.array(
        z.object({
            uuid: z.string(),
            name: z.string(),
            extension: z.string().optional(),
        })
    ).optional(),
});
