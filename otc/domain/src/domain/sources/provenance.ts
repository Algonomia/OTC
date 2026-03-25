import {z, ZodType} from 'zod';
import {
    AlgoDateValidator,
    AlgoMonoListValidator,
    AlgoStringValidator,
    ValidatorGroup
} from '@algonomia/ts-shared';
import {OrganizationType, EOrganizationTypeId} from './organization-type/organization-type';
import {ZOrganizationTypeIdSchema} from './organization-type/zod';

// ── Formats ─────────────────────────────────────────────────────────────────────

export type THttpFormat = { date: string; timestamp: number };
export type TFrontFormat = { date: Date; timestamp: Date };

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface ISourceId {
    source_id: number;
}

export interface ISourceProvenance<F extends THttpFormat | TFrontFormat = THttpFormat> {
    source_name: string;
    organization: string;
    organization_type_id: EOrganizationTypeId;
    date_of_publication?: F['timestamp'];
}

export type ICreateSourceProvenance = ISourceProvenance<TFrontFormat>;
export type IHTTPSourceProvenance = ISourceProvenance;

export interface ISourceProvenanceExt {
    source_name: string;
    organization: string;
    organization_type: OrganizationType;
    date_of_publication?: Date;
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────────

export const ZSourceProvenanceSchema: ZodType<ICreateSourceProvenance> = z.object({
    source_name: z.string(),
    organization: z.string(),
    organization_type_id: ZOrganizationTypeIdSchema,
    date_of_publication: z.date().optional()
});

export const ZHTTPSourceProvenanceSchema: z.ZodType<IHTTPSourceProvenance> = z.object({
    source_name: z.string(),
    organization: z.string(),
    organization_type_id: ZOrganizationTypeIdSchema,
    date_of_publication: z.number().optional()
});

// ── Validators ──────────────────────────────────────────────────────────────────

const _sourceProvenanceValidatorCommonParams = {
    source_name: new AlgoStringValidator({
        required: true,
        minLength: 3,
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.NameSource.Name',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.NameSource.Placeholder'
    }),
    organization: new AlgoStringValidator({
        required: true,
        minLength: 2,
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.OrganizationSource.Organization',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.OrganizationSource.Placeholder'
    }),
    organization_type_id: new AlgoMonoListValidator({
        required: true,
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectConcernedOrganizationType',
        placeholder: 'ObligationDueDateDomain.SourcesSubInterfaces.SelectOrganizationType',
        list: (OrganizationType.getAllAvailables() as OrganizationType[]).map(((x: OrganizationType) => x.id as EOrganizationTypeId)),
        textCallback: ((x: EOrganizationTypeId) => OrganizationType.getText(x)),
        translate: true
    })
}

export const sourceProvenanceValidator = new ValidatorGroup<ICreateSourceProvenance>({
    ..._sourceProvenanceValidatorCommonParams,
    date_of_publication: new AlgoDateValidator({
        label: 'ObligationDueDateDomain.SourcesSubInterfaces.DateOfPublication'
    })
});

export const httpSourceProvenanceValidator = new ValidatorGroup<IHTTPSourceProvenance>({
    ..._sourceProvenanceValidatorCommonParams
});
