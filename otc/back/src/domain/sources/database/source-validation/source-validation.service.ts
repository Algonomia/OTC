import {Injectable} from '@nestjs/common';
import {ESourceStatus, ESourceType} from '@otc/domain';
import {KnexDatabaseProvider} from '../../../../utils/database/knex';
import {Knex} from 'knex';
import {DBGetUser} from '../../../../auth/database/get';

@Injectable()
export class SourceValidationService {
    private readonly _FILE_STATUS_ORDER: ReadonlyArray<ESourceStatus> = [
        ESourceStatus.ScanForMalware,
        ESourceStatus.WaitForValidation,
        ESourceStatus.WaitForOCR,
        ESourceStatus.WaitForAI,
        ESourceStatus.FullyProcessed
    ];

    private readonly _URL_STATUS_ORDER: ReadonlyArray<ESourceStatus> = [
        ESourceStatus.WaitForUrlSafeBrowsingCheck,
        ESourceStatus.WaitForUrlMalwareScan,
        ESourceStatus.WaitForValidation,
        ESourceStatus.WaitForScrapping,
        ESourceStatus.WaitForOCR,
        ESourceStatus.WaitForAI,
        ESourceStatus.FullyProcessed
    ];

    private readonly _database: Knex;

    constructor(
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private readonly _getUser: DBGetUser
    ) {
        this._database = this._knexDatabaseProvider.knex;
    }

    async validateSource(source_id: number, comment: string) {
        const nextStatus = await this.nextSourceStatus(source_id);
        await this._database('source')
            .where('id', source_id)
            .andWhere('status', ESourceStatus.WaitForValidation)
            .update({status: nextStatus, admin_comment: comment ?? ''});
    }

    async rejectSources(source_ids: number[], rejectionStatus: ESourceStatus, comment: string = '') {
        if (source_ids.length === 0) return 0;

        return this._database('source')
            .whereIn('id', source_ids)
            .whereNotIn('status', [
                ESourceStatus.RejectedByAdmin,
                ESourceStatus.RejectedUrl,
                ESourceStatus.RejectedByMalwareScan,
                ESourceStatus.FullyProcessed
            ])
            .update({status: rejectionStatus, comment: comment ?? ''});
    }

    async updateSource(sourceId: number, extra_attributes: {[key: string]: any}): Promise<void> {
        const nextStatus = await this.nextSourceStatus(sourceId);
        await this._knexDatabaseProvider.knex('source')
            .where('id', sourceId)
            .update({
                status: nextStatus,
                ...extra_attributes
            });
    }

    async updateSourceStatuses(source_ids: number[]): Promise<void> {
        const nextStatuses = await this.nextSourceStatuses(source_ids);
        if (nextStatuses.length === 0) return;

        const knex = this._knexDatabaseProvider.knex;
        const values = nextStatuses.map(() => '(?, ?)').join(', ');
        const bindings = nextStatuses.flatMap(s => [s.source_id, s.next_status]);

        await knex.raw(`
            UPDATE source AS s
            SET status = v.status::"SourceStatus"
            FROM (VALUES ${values}) AS v(id, status)
            WHERE s.id = v.id::int
        `, bindings);
    }

    async nextSourceStatus(source_id: number) {
        return (await this.nextSourceStatuses([source_id]))[0]?.next_status;
    }

    async nextSourceStatuses(source_ids: number[]): Promise<{source_id: number, next_status: ESourceStatus}[]> {
        const sources = await this._database('source')
            .select('id', 'proposer_email', 'source_type', 'status', '_process_by_ai')
            .whereIn('id', source_ids);

        const emails = [...new Set(sources.map(s => s.proposer_email))];
        const trustedUsers = await this._getUser.getAdminOrTrustedUser(emails);
        const trustedEmails = new Set(trustedUsers.map(u => u.email));

        return sources.map(source => {
            const jumpStatuses: ESourceStatus[] = [];
            if (trustedEmails.has(source.proposer_email)) {
                jumpStatuses.push(ESourceStatus.WaitForValidation);
            }
            if (source._process_by_ai === false) {
                jumpStatuses.push(ESourceStatus.WaitForAI);
            }
            let nextStatus = source.status;
            if (source.source_type === ESourceType.FILES) {
                nextStatus = this._nextFileSourceStatus(source.status, jumpStatuses);
            } else if (source.source_type === ESourceType.URL) {
                nextStatus = this._nextURLSourceStatus(source.status, jumpStatuses);
            }
            return {source_id: source.id, next_status: nextStatus};
        });
    }

    async initialFileStatus(proposer_email: string, malwareScan: 'INFECTED' | 'CLEAN' | 'PENDING') {
        if (malwareScan === 'INFECTED') {
            return ESourceStatus.RejectedByMalwareScan;
        }
        const isTrusted = await this._getUser.isUserAdminOrTrusted(proposer_email);
        const jumpStatuses = isTrusted ? [ESourceStatus.WaitForValidation] : [];
        if (malwareScan === 'CLEAN') {
            jumpStatuses.push(ESourceStatus.ScanForMalware)
        }
        return this._nextFileSourceStatus(null, jumpStatuses);
    }

    isSourceValidated(sourceType: ESourceType, status: ESourceStatus) {
        if (sourceType === ESourceType.URL) {
            return this._URL_STATUS_ORDER.indexOf(status) > this._URL_STATUS_ORDER.indexOf(ESourceStatus.WaitForValidation);
        } else if (sourceType === ESourceType.FILES) {
            return this._FILE_STATUS_ORDER.indexOf(status) > this._FILE_STATUS_ORDER.indexOf(ESourceStatus.WaitForValidation);
        }
        return false;
    }

    initialURLStatus(proposer_email: string) {
        return this._nextURLSourceStatus(null);
    }

    private _nextFileSourceStatus = this._nextSourceStatus.bind(this, this._FILE_STATUS_ORDER);
    private _nextURLSourceStatus = this._nextSourceStatus.bind(this, this._URL_STATUS_ORDER);

    private _nextSourceStatus(
        STATUS_ORDER: ESourceStatus[], sourceStatus: ESourceStatus | null, jumpStatuses: ESourceStatus[] = []
    ): ESourceStatus {
        const currentStatusIdx = STATUS_ORDER.indexOf(sourceStatus!) ?? -1;
        if (currentStatusIdx === STATUS_ORDER.length - 1) {
            return STATUS_ORDER[STATUS_ORDER.length - 1];
        }
        let next_status_idx = currentStatusIdx + 1
        while (jumpStatuses.includes(STATUS_ORDER[next_status_idx]) && next_status_idx < STATUS_ORDER.length) {
            ++next_status_idx;
        }
        return STATUS_ORDER[next_status_idx] ?? sourceStatus ?? ESourceStatus.WaitForValidation;
    }
}
