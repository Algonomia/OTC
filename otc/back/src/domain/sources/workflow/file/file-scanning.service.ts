import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { ESourceStatus } from "@otc/domain";
import { PersistentStorageClient } from '@astorage/ts-client';
import { GetSourcesService } from "../../database/get-sources/get-sources.service";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import { BDDSources } from '../../database/create-source/create-source.service';
import { IFileMeta } from "@algonomia/ts-shared";
import { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { FileMetaService } from "src/utils/files/file-meta.service";
import { APP_LOGGER } from '../../../../utils/monitoring/logger/logger.factory';
import { SourceCronjob } from "../source-cronjob.decorator";;

@Injectable()
export class FileScanningService {
    constructor(
        private readonly _persistentStorageClient: PersistentStorageClient,
        private readonly _getSourcesService: GetSourcesService,
        private readonly _sourceValidationService: SourceValidationService,
        @Inject(APP_LOGGER) private readonly _logger: LoggerService
    ) {}

    @SourceCronjob('File Scanning')
    async verifyFileScanOnSource(): Promise<CronjobItemResult[]> {
        const sources = await this._getSourcesService.getSourcesFromStatus(ESourceStatus.ScanForMalware);
        const fileUUIDs = sources.map(source => source.file_uuids).flat().filter(x => x !== undefined);
        const sourcesFilesMeta = await this._persistentStorageClient.getFileMetadata(fileUUIDs);

        return Promise.all(sources.map(source => this.verifyMalwareScanAndUpdateSource(source, sourcesFilesMeta)));
    }

    private async verifyMalwareScanAndUpdateSource(source: BDDSources, sourceFilesMeta: IFileMeta[]): Promise<CronjobItemResult> {
        const fileMeta = FileMetaService.getFilesMetaFileUuids(source.file_uuids ?? [], sourceFilesMeta);
        const malwareScan = FileMetaService.getAggregatedMalwareScan(fileMeta);

        if (malwareScan === 'CLEAN') {
            await this._sourceValidationService.updateSourceStatuses([source.id!]);
            return { sourceId: source.id!, success: true };
        }
        if (malwareScan === 'INFECTED') {
            await this._sourceValidationService.rejectSources([source.id!], ESourceStatus.RejectedByMalwareScan);
        }
        return { sourceId: source.id!, success: false };
    }
}
