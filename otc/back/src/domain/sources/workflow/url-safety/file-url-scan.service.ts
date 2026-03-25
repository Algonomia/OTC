import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { VirusTotalApiService } from "../../../../external-api/url-safety/virus-total-api.service";
import { KnexDatabaseProvider } from "../../../../utils/database/knex";
import { ESourceStatus } from "@otc/domain";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { APP_LOGGER } from '../../../../utils/monitoring/logger/logger.factory';
import { SourceCronjob } from "../source-cronjob.decorator";;

export type BDDScanAnalysis = {
    id: number;
    source_id: number;
    scan_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

@Injectable()
export class FileUrlScanService {
    constructor(
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private readonly _virusTotalApiService: VirusTotalApiService,
        private readonly _sourceValidationService: SourceValidationService,
        @Inject(APP_LOGGER) private _logger: LoggerService
    ) {}

    @SourceCronjob('Malware Scan')
    async callFileUrlScanOnSource(): Promise<CronjobItemResult[]> {
        const sources = await this._getSourcesToScan();
        return Promise.all(sources.map(source => this._scanSource(source)));
    }

    @SourceCronjob('Malware Scan Analysis')
    async verifyScanAnalysisStatus(): Promise<CronjobItemResult[]> {
        const scanAnalyses = await this._getSourcesScanAnalysisRecord();
        return Promise.all(scanAnalyses.map(analysis => this._verifyAnalysis(analysis)));
    }

    private async _scanSource(source: { id: number; link: string }): Promise<CronjobItemResult> {
        try {
            const scanId = await this._virusTotalApiService.initiateUrlScan(source.link!);
            await this._createScanAnalysisRecord(source.id!, scanId);
            return { sourceId: source.id!, success: true };
        } catch (error) {
            this._logger.error(`Malware Scan failed for source ${source.id}: ${error.message}`, { context: 'FileUrlScanService', source_id: source.id });
            return { sourceId: source.id!, success: false };
        }
    }

    private async _verifyAnalysis(analysis: BDDScanAnalysis): Promise<CronjobItemResult> {
        try {
            const { status, rejected } = await this._virusTotalApiService.getUrlAnalysis(analysis.scan_id);
            await this._updateScanAnalysisStatusRecord(analysis.source_id, status);

            if (status === 'completed') {
                if (rejected) {
                    await this._sourceValidationService.rejectSources([analysis.source_id], ESourceStatus.RejectedUrl);
                } else {
                    await this._sourceValidationService.updateSourceStatuses([analysis.source_id]);
                }
            }

            return { sourceId: analysis.source_id, success: true };
        } catch (error) {
            this._logger.error(`Malware Scan Analysis failed for source ${analysis.source_id}: ${error.message}`, { context: 'FileUrlScanService', source_id: analysis.source_id });
            return { sourceId: analysis.source_id, success: false };
        }
    }

    private _getSourcesToScan() {
        return this._knexDatabaseProvider.knex('source')
            .select('source.id', 'source.link')
            .leftJoin('scan_analysis', 'source.id', 'scan_analysis.source_id')
            .where({
                'status': ESourceStatus.WaitForUrlMalwareScan,
                'scan_analysis.source_id': null
            })
            .limit(this._virusTotalApiService.rateLimitApi);
    }

    private _createScanAnalysisRecord(sourceId: number, scanId: string) {
        return this._knexDatabaseProvider.knex('scan_analysis')
            .insert({
                source_id: sourceId,
                scan_id: scanId,
                scan_status: 'initialized'
            });
    }

    private async _getSourcesScanAnalysisRecord(): Promise<BDDScanAnalysis[]> {
        return this._knexDatabaseProvider.knex('source')
            .select('scan_analysis.*')
            .innerJoin('scan_analysis', 'source.id', 'scan_analysis.source_id')
            .where('status', ESourceStatus.WaitForUrlMalwareScan);
    }

    private _updateScanAnalysisStatusRecord(sourceId: number, status: string) {
        return this._knexDatabaseProvider.knex('scan_analysis')
            .update({ scan_status: status })
            .where({ source_id: sourceId });
    }
}
