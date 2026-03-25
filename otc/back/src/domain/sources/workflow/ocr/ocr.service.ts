import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { ESourceStatus } from "@otc/domain";
import { OcrApiService } from "../../../../external-api/ocr/ocr-api.service";
import { PersistentStorageClient } from '@astorage/ts-client';
import { GetSourcesService } from "../../database/get-sources/get-sources.service";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import { BDDSources } from '../../database/create-source/create-source.service';
import { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { APP_LOGGER } from '../../../../utils/monitoring/logger/logger.factory';
import { SourceCronjob } from "../source-cronjob.decorator";;

@Injectable()
export class OcrService {
    constructor(
        private readonly _persistentStorageClient: PersistentStorageClient,
        private readonly _getSourcesService: GetSourcesService,
        private readonly _ocrApiService: OcrApiService,
        private readonly _sourceValidationService: SourceValidationService,
        @Inject(APP_LOGGER) private _logger: LoggerService
    ) {}

    @SourceCronjob('OCR')
    async callOcrOnSource(): Promise<CronjobItemResult[]> {
        const sources = await this._getSourcesService.getSourcesFromStatus(ESourceStatus.WaitForOCR);
        const validOCRSources = sources.filter(source => source.file_uuids && source.file_uuids.length > 0);
        const ocrPromises = validOCRSources.map(source => this._ocrizeSource(source));

        return Promise.all(ocrPromises);
    }

    private async _ocrizeSource(source: BDDSources): Promise<CronjobItemResult> {
        const sourceId = source.id!;

        try {
            const { urls } = await this._persistentStorageClient.getPresignedUrls(source.file_uuids!);
            const ocrResult = await this._ocrApiService.uploadFilesFromUrls(urls);
            const ocr_uuids = ocrResult.map(f => f.id);
            await this._sourceValidationService.updateSource(source.id!, {ocr_file_ids: ocr_uuids});
            return { sourceId: sourceId, success: true };
        } catch (error) {
            this._logger.error(`Failed to process OCR for source ID ${sourceId}: ${error.message}`, { context: 'OcrService', source_id: sourceId });
            return { sourceId: sourceId, success: false };
        }
    }
}
