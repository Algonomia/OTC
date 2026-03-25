import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { OcrService } from '../workflow/ocr/ocr.service';
import { ScraperService } from '../workflow/scraper/scraper.service';
import { SafeBrowsingService } from '../workflow/url-safety/safe-browsing.service';
import { FileUrlScanService } from '../workflow/url-safety/file-url-scan.service';
import { AuditTestGuard } from 'src/GUARDS/audit-test.guard';
import { FileScanningService } from '../workflow/file/file-scanning.service';
import { AiService } from '../workflow/ai/ai.service';
import { AiTaskService } from '../database/ai-task/ai-task.service';
import { GetSourcesService } from '../database/get-sources/get-sources.service';
import { ESourceStatus } from '@otc/domain';
import { OTCAiApiService, AiJobStatus } from 'src/external-api/ai/ai-api.service';

@ApiExcludeController()
@Controller('sources/audit')
export class SourcesAuditController {
    constructor(
        private readonly _ocrService: OcrService,
        private readonly _scraperService: ScraperService,
        private readonly _safeBrowsingService: SafeBrowsingService,
        private readonly _fileUrlScanService: FileUrlScanService,
        private readonly _fileScanningService: FileScanningService,
        private readonly _aiService: AiService,
        private readonly _aiTaskService: AiTaskService,
        private readonly _getSourcesService: GetSourcesService,
        private readonly _aiApiService: OTCAiApiService
    ) {}

    @Get('ocr')
    @UseGuards(AuditTestGuard)
    async testOcr() {
        return this._ocrService.callOcrOnSource();
    }

    @Get('scrap')
    @UseGuards(AuditTestGuard)
    async testScrap() {
        return this._scraperService.callScraperOnSource();
    }

    @Get('url-scan')
    @UseGuards(AuditTestGuard)
    async testUrlScan() {
        return this._safeBrowsingService.callUrlScanOnSource();
    }

    @Get('file-url-scan')
    @UseGuards(AuditTestGuard)
    async testFileUrlScan() {
        return this._fileUrlScanService.callFileUrlScanOnSource();
    }

    @Get('verify-file-url-scan')
    @UseGuards(AuditTestGuard)
    async testVerifyFileUrlScan() {
        return this._fileUrlScanService.verifyScanAnalysisStatus();
    }

    @Get('verify-file-scan')
    @UseGuards(AuditTestGuard)
    async verifyFileScan() {
        return this._fileScanningService.verifyFileScanOnSource();
    }

    @Get('ai')
    @UseGuards(AuditTestGuard)
    async callLLM() {
        return this._aiService.callAiOnSource();
    }

    @Get('ai-job')
    @UseGuards(AuditTestGuard)
    async getRunningLLMJob() {
        const sources = await this._getSourcesService.getSourcesFromStatus(ESourceStatus.WaitForAI);

        return Promise.all(sources.map(async source => {
            const task = await this._aiTaskService.getTaskToProcess(source.id!)
            if (task && task.status === AiJobStatus.IN_PROGRESS) {
                return this._aiApiService.getJob(task.job_id!);
            } else {
                return 'No running job'
            }
        }));
    }
}
