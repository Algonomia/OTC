import { Injectable } from '@nestjs/common';
import {KnexDatabaseProvider} from '../../../../utils/database/knex';
import {TSourceKeyInfo, TSourceKeyInfoRefs, ESourceStatus} from '@otc/domain';
import {ArrayUtils, IFileMeta, IFileWithUUID, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import { PersistentStorageClient } from '@astorage/ts-client';
import {BDDSources} from '../create-source/create-source.service';
import { Knex } from 'knex';

@Injectable()
export class GetSourcesService {
    private readonly _database: Knex;

    constructor(
        private _knexDatabaseProvider: KnexDatabaseProvider,
        private _persistentStorageClient: PersistentStorageClient
    ) {
        this._database = this._knexDatabaseProvider.knex;
    }

    async get(): Promise<TSourceKeyInfo[]> {
        const shortMetas: TSourceKeyInfoRefs[] = await this._getSourceShortMeta();
        const fileUUIDs = shortMetas.map(
            source => source.file_uuids
        ).flat().filter(x => !isNullOrUndefined(x)) as string[];
        const fileData: IFileMeta[] = await this._persistentStorageClient.getFileMetadata(fileUUIDs);
        const sortedFileData = ArrayUtils.convertThenSort(fileData, x => x.uuid);

        return shortMetas.map(shortMeta => {
            const fileDs = this._getFileDs(shortMeta, sortedFileData);
            return {
                ...shortMeta,
                files: fileDs
            }
        });
    }

    private async _getSourceShortMeta(): Promise<TSourceKeyInfoRefs[]> {
        return this._database('source').select(
            'id as source_id',
            'source_name',
            'organization',
            'organization_type_id',
            'link',
            'file_uuids',
            'date_of_publication'
        );
    }

    private _getFileDs(shortMetas: TSourceKeyInfoRefs, sortedFileData: IFileMeta[]) {
        const files: IFileWithUUID[] = [];
        shortMetas.file_uuids?.forEach(uuid => {
            const fileD = ArrayUtils.findWithBinarySearch(sortedFileData, uuid, (x, y) => ArrayUtils.STANDARD_GENERAL_COMPARATOR(x.uuid, y));
            if (!!fileD) {
                files.push({uuid: fileD.uuid, name: fileD.name, size: fileD.size, extension: fileD.extension});
            }
        });
        return files;
    }

    getSourcesFromStatusWithLimit(status: ESourceStatus, limit: number): Promise<BDDSources[]> {
        return this.getSourcesFromStatus(status).limit(limit);
    }

    getSourcesFromStatus(status: ESourceStatus) {
        return this._database('source')
            .select('*', this._database.raw('obligation_type_ids::TEXT[]'))
            .where('status', status)
            .orderBy('id');
    }
}
