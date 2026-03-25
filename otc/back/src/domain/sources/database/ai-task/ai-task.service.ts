import { Injectable } from '@nestjs/common';
import { TAiProcessingGroup, Indicator, EIndicatorId, EObligationTypeId } from '@otc/domain';
import { KnexDatabaseProvider } from '../../../../utils/database/knex';
import type { BDDSources } from '../create-source/create-source.service';
import { AiJobStatus } from '../../../../external-api/ai/ai-api.service';

export interface AiTask {
    source_id: number;
    jurisdiction: string;
    obligation_type: EObligationTypeId;
    group: TAiProcessingGroup;
    indicators: EIndicatorId[];
    status: AiJobStatus;
    job_id: string | null;
    retry_after: Date | null;
}

@Injectable()
export class AiTaskService {
    constructor(private readonly _knexDatabaseProvider: KnexDatabaseProvider) {}

    async upsertTasksForSource(source: BDDSources): Promise<void> {
        const sourceId = source.id!;
        const existing = await this._knexDatabaseProvider.knex('otc_ai_task')
            .where({ source_id: sourceId })
            .count('* as count')
            .first();

        if (Number(existing?.count ?? 0) > 0) return;

        const rows = this._buildTaskRows(source);
        await this._knexDatabaseProvider.knex('otc_ai_task').insert(rows);
    }

    private _buildTaskRows(source: BDDSources) {
        const sourceId = source.id!;
        const groups = Indicator.resolveIndicatorsByAiProcessingGroup(source.indicators);

        return source.jurisdictions.flatMap(jurisdiction =>
            source.obligation_type_ids.flatMap(obligation_type =>
                groups.map(group => ({
                    source_id: sourceId,
                    jurisdiction,
                    obligation_type,
                    group: group.name,
                    indicators: group.indicators,
                    status: AiJobStatus.PENDING,
                }))
            )
        );
    }

    getTaskToProcess(sourceId: number): Promise<AiTask | undefined> {
        const status = [AiJobStatus.IN_PROGRESS, AiJobStatus.PENDING, AiJobStatus.FAILED];
        return this._knexDatabaseProvider.knex('otc_ai_task')
            .where({ source_id: sourceId })
            .whereIn('status', status)
            .where(builder => builder
                .whereNull('retry_after')
                .orWhere('retry_after', '<=', new Date())
            )
            .orderByRaw('CASE status WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 END', status)
            .first();
    }

    async areAllTasksCompleted(sourceId: number): Promise<boolean> {
        const result = await this._knexDatabaseProvider.knex('otc_ai_task')
            .where({ source_id: sourceId })
            .whereNot({ status: AiJobStatus.COMPLETED })
            .count('* as count')
            .first();
        return Number(result?.count ?? 0) === 0;
    }

    markTaskCompleted(task: AiTask): Promise<void> {
        return this._knexDatabaseProvider.knex('otc_ai_task')
            .where(this._taskKey(task))
            .update({ status: AiJobStatus.COMPLETED });
    }

    markTaskFailed(task: AiTask, retryAfter?: string | null): Promise<void> {
        return this._knexDatabaseProvider.knex('otc_ai_task')
            .where(this._taskKey(task))
            .update({
                status: AiJobStatus.FAILED,
                job_id: null,
                retry_after: retryAfter ? new Date(retryAfter) : null,
            });
    }

    markTaskInProgress(task: AiTask, jobId: string): Promise<void> {
        return this._knexDatabaseProvider.knex('otc_ai_task')
            .where(this._taskKey(task))
            .update({ status: AiJobStatus.IN_PROGRESS, job_id: jobId });
    }

    private _taskKey(task: AiTask) {
        return {
            source_id: task.source_id,
            jurisdiction: task.jurisdiction,
            obligation_type: task.obligation_type,
            group: task.group,
        };
    }

    resetInProgressTasks(sourceId: number): Promise<void> {
        return this._knexDatabaseProvider.knex('otc_ai_task')
            .where({ source_id: sourceId, status: AiJobStatus.IN_PROGRESS })
            .update({ status: AiJobStatus.PENDING, job_id: null });
    }
}
