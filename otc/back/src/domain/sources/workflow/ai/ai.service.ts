import { HttpException, HttpStatus, Inject, Injectable, LoggerService } from "@nestjs/common";
import { ESourceStatus } from "@otc/domain";
import { GetSourcesService } from "../../database/get-sources/get-sources.service";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import type { BDDSources } from '../../database/create-source/create-source.service';
import type { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { APP_LOGGER } from '../../../../utils/monitoring/logger/logger.factory';
import { OTCAiApiService, AiJobStatus, type AiOutputValues, type AiSourceData } from "../../../../external-api/ai/ai-api.service";
import { OcrApiService } from "../../../../external-api/ocr/ocr-api.service";
import { KnexDatabaseProvider } from "../../../../utils/database/knex";
import { SourceCronjob } from "../source-cronjob.decorator";
import { AiTaskService, type AiTask } from "../../database/ai-task/ai-task.service";
import { ConfigService } from "@nestjs/config";

const EVERY_30_SECONDS = '*/30 * * * * *';
const SOURCE_LIMIT = 1;

@Injectable()
export class AiService {
    private readonly _sourceLimit: number;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private readonly _getSourcesService: GetSourcesService,
        private readonly _sourceValidationService: SourceValidationService,
        private readonly _ocrApiService: OcrApiService,
        private readonly _aiApiService: OTCAiApiService,
        private readonly _AiTaskService: AiTaskService,
        @Inject(APP_LOGGER) private readonly _logger: LoggerService
    ) {
        this._sourceLimit = this._configService.get<number>('AI_SOURCE_LIMIT') ?? SOURCE_LIMIT;
    }

    @SourceCronjob('AI', EVERY_30_SECONDS)
    async callAiOnSource(): Promise<CronjobItemResult[]> {
        const [source] = await this._getSourcesService.getSourcesFromStatusWithLimit(ESourceStatus.WaitForAI, this._sourceLimit);
        if (!source) return [];
        const llmResult = await this._processSource(source);
        return [llmResult];
    }

    private async _processSource(source: BDDSources): Promise<CronjobItemResult> {
        const sourceId = source.id!;
        try {
            await this._AiTaskService.upsertTasksForSource(source);

            const task = await this._AiTaskService.getTaskToProcess(sourceId);
            if (task) await this._runAiTask(task, source);

            if (await this._AiTaskService.areAllTasksCompleted(sourceId)) {
                await this._sourceValidationService.updateSourceStatuses([sourceId]);
            }

            return { sourceId, success: true };
        } catch (error: any) {
            this._logger.error(`Failed to process LLM for source ID ${sourceId}: ${error.message}`, { context: 'AiService', source_id: sourceId });
            return { sourceId, success: false };
        }
    }

    private async _runAiTask(task: AiTask, source: BDDSources): Promise<void> {
        if (task.status === AiJobStatus.IN_PROGRESS) {
            await this._longPollLLMJob(task);
        } else {
            const aiSourceData = this._buildAiSourceData(task, source);
            const jobId = await this._aiApiService.startPipeline(aiSourceData);
            await this._AiTaskService.markTaskInProgress(task, jobId);
        }
    }

    private async _longPollLLMJob(task: AiTask): Promise<void> {
        try {
            const job = await this._aiApiService.getJob(task.job_id!);
            if (job.status === AiJobStatus.COMPLETED) {
                if (job.values.length > 0) {
                    await this._saveLLMValues(job.values);
                }
                await this._AiTaskService.markTaskCompleted(task);
            } else if (job.status === AiJobStatus.FAILED) {
                this._logger.error(`Failed to process LLM for task ID ${job.job_id} on source ID ${task.source_id}`, job.error);
                await this._AiTaskService.markTaskFailed(task, job.retry_after);
            }
        } catch (error: unknown) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
                await this._AiTaskService.resetInProgressTasks(task.source_id);
                return;
            }
            throw error;
        }
    }

    private _buildAiSourceData(task: AiTask, source: BDDSources): AiSourceData {
        return {
            source_id: task.source_id,
            jurisdictions: [task.jurisdiction],
            obligations_type_ids: [task.obligation_type],
            indicators_ids: task.indicators,
            file_paths: this._ocrApiService.getFileUrls(source.ocr_file_ids ?? []),
        };
    }

    private _saveLLMValues(values: AiOutputValues[]) {
        return this._knexDatabaseProvider.knex('otc_llm_value')
            .insert(values.map(value => ({
                source_id: value.source_id,
                jurisdiction: value.jurisdiction,
                obligation_type_id: value.obligation_type_id,
                key: value.key,
                value: value.value ? JSON.stringify(value.value) : {},
                notes: value.notes ?? '',
                reference: value.references ?? '',
                additional_values: value.additional_values ? JSON.stringify(value.additional_values) : {},
                tag_notes: value.tag_notes ?? '',
                judge_llm_score: value.llm_evaluation_score,
                judge_llm_reasoning: value.llm_evaluation_reasoning
            })));
    }
}
