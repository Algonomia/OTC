import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { KnexDatabaseProvider } from '../../database/knex';
import { TimeUnit, TimeUtils } from '@algonomia/ts-shared';
import { APP_LOGGER } from '../logger/logger.factory';

const SYNC_INTERVAL_MS = TimeUtils.toMs(1, TimeUnit.minutes) ?? 60000;

@Injectable()
export class ApiUsageBufferService {
    private buffer = new Map<string, Date>();
    private isSyncing = false;

    constructor(
        private readonly _database: KnexDatabaseProvider,
        @Inject(APP_LOGGER) private readonly _logger: LoggerService
    ) {}

    addRequest(access_key: string, provider: string): void {
        const key = `${access_key}::${provider}`;
        const existing = this.buffer.get(key);
        const now = new Date();

        if (!existing || now > existing) {
            this.buffer.set(key, now);
        }
    }

    @Interval(SYNC_INTERVAL_MS)
    async syncToDatabase(): Promise<void> {
        if (this.isSyncing || this.buffer.size === 0) {
            return;
        }

        this.isSyncing = true;
        const entries = new Map(this.buffer);
        this.buffer.clear();

        try {
            await this.batchUpsert(entries);
            this._logger.log(`Synced ${entries.size} access keys to audit table`);
        } catch (error) {
            this._logger.error('Failed to sync buffer to database', error.stack);
        } finally {
            this.isSyncing = false;
        }
    }

    private async batchUpsert(entries: Map<string, Date>): Promise<void> {
        const rows = Array.from(entries, ([key, timestamp]) => {
            const [access_key, provider] = key.split('::');
            return { access_key, provider, last_used_at: timestamp };
        });

        await this._database.knex('otc_access_token_audit')
            .insert(rows)
            .onConflict('access_key')
            .merge(['provider', 'last_used_at']);
    }
}
