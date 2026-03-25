import {Injectable} from '@nestjs/common';
import {
    THTTPCreateFileSources,
    THTTPCreateLinkSources,
    THTTPCreateSources, EIndicatorId,
    TSourceView,
    EObligationTypeId,
    EOrganizationTypeId,
    ESourceStatus, ESourceType
} from '@otc/domain';
import {ArrayUtils, IFileMeta, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import { PersistentStorageClient } from '@astorage/ts-client';
import {KnexDatabaseProvider} from '../../../../utils/database/knex';
import {Knex} from 'knex';
import {SourceValidationService} from '../source-validation/source-validation.service';
import { FileMetaService } from '../../../../utils/files/file-meta.service';

export interface BDDSources {
    id?: number;
    source_name: string;
    organization: string;
    organization_type_id: EOrganizationTypeId;
    date_of_publication?: Date;
    jurisdictions: string[];
    obligation_type_ids: EObligationTypeId[];
    indicators: EIndicatorId[];
    status: ESourceStatus;
    proposer_email: string;
    created_at: Date;
    validator_email?: string;
    validated_at?: Date;
    source_type: ESourceType;
    link?: string;
    admin_comment?: string;
    comment: string;
    file_uuids?: string[];
    ocr_file_ids?: number[]
}

@Injectable()
export class CreateSourceService {
    private readonly _database: Knex;

    constructor(
        private _persistentStorageClient: PersistentStorageClient,
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private _sourceValidation: SourceValidationService
    ) {
        this._database = this._knexDatabaseProvider.knex;
    }

    createLinkSource(createSource: THTTPCreateLinkSources, email: string) {
        const stdBddSource = {
            ...this._getStdBDDSource(createSource),
            source_type: ESourceType.URL,
            proposer_email: email,
            link: createSource.link,
            status: this._sourceValidation.initialURLStatus(email)
        }
        return this._insertBDDSource(stdBddSource);
    }

    async createFileSource(createSource: THTTPCreateFileSources, multerFiles: Express.Multer.File[], email: string) {
        const files = await this._persistentStorageClient.uploadFiles(multerFiles);
        const uuids = files.map(x => x.uuid);
        const malwareScan = FileMetaService.getAggregatedMalwareScan(files);
        const status = await this._sourceValidation.initialFileStatus(email, malwareScan);

        const bddSource: BDDSources = {
            ...this._getStdBDDSource(createSource),
            source_type: ESourceType.FILES,
            file_uuids: uuids,
            status: status,
            proposer_email: email
        };
        return this._insertBDDSource(bddSource);
    }

    private _getStdBDDSource(source: THTTPCreateSources) {
        return {
            source_name: source.source_name,
            organization: source.organization,
            organization_type_id: source.organization_type_id,
            date_of_publication: !!source.date_of_publication ? new Date(source.date_of_publication) : undefined,
            jurisdictions: [source.jurisdictions].flat().filter(x => !isNullOrUndefined(x)),
            obligation_type_ids: [source.obligation_type_ids].flat().filter(x => !isNullOrUndefined(x)),
            indicators: [source.indicator_ids].flat().filter(x => !isNullOrUndefined(x)),
            status: ESourceStatus.WaitForValidation,
            created_at: new Date(),
            comment: source.comment ?? ''
        };
    }

    private async _insertBDDSource(bddSource: BDDSources) {
        const insertedSources: BDDSources[] = await this._database('source')
            .insert(bddSource)
            .returning('*');

        return this._convertBddSource(insertedSources);
    }

    private async _convertBddSource(bddSources: BDDSources[]): Promise<TSourceView[]> {
        const fileUUIDs = bddSources.map(
            source => source.file_uuids
        ).flat().filter(x => !isNullOrUndefined(x)) as string[];
        const fileData: IFileMeta[] = await this._persistentStorageClient.getFileMetadata(fileUUIDs);
        const sortedFileData = ArrayUtils.convertThenSort(fileData, x => x.uuid);

        return bddSources.map(bddSource => {
            const files = FileMetaService.getFileDsFromFileUuids(bddSource.file_uuids ?? [], sortedFileData);
            return {
                source_id: bddSource?.id ?? -1,
                source_name: bddSource.source_name ?? '',
                organization: bddSource.organization ?? '',
                organization_type_id: bddSource.organization_type_id ?? undefined,
                date_of_publication: bddSource.date_of_publication?.getTime() ?? undefined,
                jurisdictions: bddSource.jurisdictions ?? [],
                obligation_type_ids: bddSource.obligation_type_ids ?? [],
                indicator_ids: bddSource.indicators ?? [],
                status_id: bddSource.status ?? undefined,
                proposed_by: bddSource.proposer_email ?? undefined,
                proposed_at: bddSource.created_at?.getTime() ?? undefined,
                validated_by: bddSource.validator_email ?? undefined,
                validated_at: bddSource.validated_at?.getTime() ?? undefined,
                source_type: bddSource.source_type ?? undefined,
                link: bddSource.link ?? undefined,
                comment: bddSource.comment ?? '',
                admin_comment: bddSource.admin_comment ?? '',
                files: files ?? undefined
            };
        });
    }
}
