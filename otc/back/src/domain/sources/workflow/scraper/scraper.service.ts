import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { ESourceStatus, ESourceType } from "@otc/domain";
import { PersistentStorageClient, PersistentStorageMicroserviceError } from '@astorage/ts-client';
import { GetSourcesService } from "../../database/get-sources/get-sources.service";
import { ScraperApiService } from "../../../../external-api/scraper/scraper-api.service";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import { BDDSources } from '../../database/create-source/create-source.service';
import { extension } from "mime-types"
import { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { APP_LOGGER } from '../../../../utils/monitoring/logger/logger.factory';
import { SourceCronjob } from "../source-cronjob.decorator";;

@Injectable()
export class ScraperService {
    constructor(
        private readonly _persistentStorageClient: PersistentStorageClient,
        private readonly _getSourcesService: GetSourcesService,
        private readonly _scraperApiService: ScraperApiService,
        private readonly _sourceValidationService: SourceValidationService,
        @Inject(APP_LOGGER) private _logger: LoggerService
    ) {}

    @SourceCronjob('Scraper')
    async callScraperOnSource(): Promise<CronjobItemResult[]> {
        const sources = await this._getSourcesService.getSourcesFromStatus(ESourceStatus.WaitForScrapping);
        const validScrappingSources = sources.filter(source => source.source_type === ESourceType.URL && source.link);
        return Promise.all(validScrappingSources.map(source => this._scrapSources(source)));
    }

    private async _scrapSources(source: BDDSources): Promise<CronjobItemResult> {
        try {
            const scrapResult = await this._scraperApiService.getUrlContent(source.link!);
            const ext = this._getScrappedFileExtension(scrapResult.mode, scrapResult.content_type);
            const [filemetadata] = await this._persistentStorageClient.uploadFileContent(
                Buffer.from(scrapResult.content, 'base64'),
                `content.${ext}`,
                scrapResult.content_type
            );
            await this._sourceValidationService.updateSource(source.id!, { file_uuids: [filemetadata.uuid] });
            return { sourceId: source.id!, success: true };
        } catch (error) {
            if (error instanceof PersistentStorageMicroserviceError && error.statusCode === 404) {
                await this._sourceValidationService.rejectSources([source.id!], ESourceStatus.RejectedUrl);
            }
            this._logger.error(`Scraper failed for source ${source.id}: ${error.message}`, { context: 'ScraperService', source_id: source.id });
            return { sourceId: source.id!, success: false };
        }
    }

    private _getScrappedFileExtension(scrapMode: string, contentType: string): string {
        if (scrapMode !== 'raw') {
            return scrapMode === 'html' ? 'html' : 'txt';
        }
        const mime = contentType.split(";")[0].trim();
        return extension(mime);
    }
}
