import {z} from 'zod';
import {ABackToFrontDTO, DateUtils} from '@algonomia/ts-shared';
import {ZSourceViewSchema} from './zod';
import {TSourceView, TSourceViewExt} from './source-view';
import {Indicator} from '../../indicators/interfaces/interfaces';
import {ObligationType} from '../../obligation-type/obligation-type';
import {SourceStatusExt} from '../status/source-status';
import {OrganizationType} from '../organization-type/organization-type';

export class SourceViewDTO extends ABackToFrontDTO<TSourceView, TSourceViewExt, z.ZodType<TSourceView>>{
    readonly uri: string = 'sources';
    protected __schema = ZSourceViewSchema;

    protected __toFront(sources: TSourceView[]) {
        return sources.map(x => this._toFront(x));
    }

    private _toFront(source: TSourceView): TSourceViewExt {
        return {
            source_id: source.source_id,
            source_name: source.source_name,
            organization: source.organization,
            organization_type: OrganizationType.getById(source.organization_type_id) as OrganizationType,
            date_of_publication: DateUtils.convertMsTimestampToDate(source.date_of_publication),
            jurisdictions: [source.jurisdictions].flat(),
            obligation_types: [source.obligation_type_ids].flat().map(x => ObligationType.getById(x) as ObligationType),
            indicators: [source.indicator_ids].flat().map(x => Indicator.getById(x) as Indicator),
            status: SourceStatusExt.getById(source.status_id) as SourceStatusExt,
            proposed_by: source.proposed_by,
            proposed_at: DateUtils.convertMsTimestampToDate(source.proposed_at) ?? new Date(0),
            validated_by: source.validated_by,
            validated_at: DateUtils.convertMsTimestampToDate(source.validated_at),
            source_type: source.source_type,
            link: source.link,
            comment: source.comment,
            admin_comment: source.admin_comment,
            files: source.files
        }
    }
}

