import { Injectable } from '@nestjs/common';
import {KnexDatabaseProvider} from '../../../../utils/database/knex';
import {
    TPartialFilterValueHTTP,
    TOTCDatum,
    IDatumHistoryView,
    IOTCDatumId, IOTCRate, ISubmitRate, TOTCHistorySegment, OTCDataToLine
} from '@otc/domain';
import {TFullSubmitRate} from '@otc/domain';
import {IDatumContributionView} from '@otc/domain';

@Injectable()
export class GetValuesService {
    constructor(private _knexDatabaseProvider: KnexDatabaseProvider) {}

    private get _datebase() {
        return this._knexDatabaseProvider.knex;
    }

    async getLines(params?: TPartialFilterValueHTTP) {
        const otcValues = await this.get(params);
        return OTCDataToLine.toLines(otcValues);
    }

    private _getValuesQuery = `SELECT * FROM get_otc_values(
        pmin_version => ?, pmax_version => ?, pmin_reliability => ?, ppriority => ?, pjurisdictions => ?,
        pobligation_types => ?, psource_ids => ?
    )`;

    async get(params?: TPartialFilterValueHTTP): Promise<TOTCDatum[]> {
        const query = await this._datebase.raw(this._getValuesQuery, [
            params?.minVersion ?? null,
            params?.maxVersion ?? null,
            params?.minReliability ?? null,
            params?.priority ?? null,
            params?.jurisdictions ?? null,
            params?.obligationTypeIds ?? null,
            params?.sourcesIds ?? null
        ]);
        return query.rows.map(row => ({
            ...row,
            id: Number(row.id),
            judge_llm_score: row.judge_llm_score === null ? undefined : Number(row.judge_llm_score)
        }));
    }

    private _getSegmentHistory = `SELECT * FROM get_otc_key_segment_history(
        puser_id => ?,
        pjurisdiction => ?,
        pobligation_type_id => ?,
        pindicator_id => ?
    )`;

    async getSegmentHistory(userId: string, segment: TOTCHistorySegment): Promise<IDatumHistoryView[]> {
        const query = await this._datebase.raw(this._getSegmentHistory, [
            userId ?? '',
            segment?.jurisdiction ?? '',
            segment?.obligation_type_id ?? null,
            segment?.key ?? null
        ]);
        return query.rows.map(row => ({
            ...row,
            id: Number(row.id),
            judge_llm_score: row.judge_llm_score === null ? undefined : Number(row.judge_llm_score)
        }));
    }

    private _getRates = `SELECT * FROM get_otc_value_all_rates(
        ptype => ?,
        pvalue_id => ?
    )`;

    async getRates(datum_id: IOTCDatumId): Promise<IOTCRate[]> {
        const query = await this._datebase.raw(this._getRates, [
            datum_id.type ?? '',
            datum_id.id ?? null
        ]);
        return query.rows;
    }

    private _getUserRates = `SELECT * FROM get_otc_value_user_rate(
        puser_id => ?,
        ptype => ?,
        pvalue_id => ?
    )`;

    async getUserRates(userId: string, datum_id: IOTCDatumId): Promise<ISubmitRate> {
        const query = await this._datebase.raw(this._getUserRates, [
            userId ?? '',
            datum_id.type ?? '',
            datum_id.id ?? null
        ]);
        return query.rows[0];
    }

    private _submitRates = `CALL create_or_update_rate(
        puser_id => ?,
        ptype => ?,
        pid => ?,
        prate => ?,
        pcomment => ?
    )`;

    async submitRates(userId: string, full_submit_rate: TFullSubmitRate) {
        return this._datebase.raw(this._submitRates, [
            userId ?? '',
            full_submit_rate.type ?? '',
            full_submit_rate.id ?? null,
            full_submit_rate.rate ?? null,
            full_submit_rate.comment ?? ''
        ]);
    }

    private _getContributions = `SELECT * FROM get_otc_contribution_view_values(prequester_email => ?)`;

    async getContributions(email: string): Promise<IDatumContributionView[]> {
        const query = await this._datebase.raw(this._getContributions, [email ?? '']);
        return query.rows ?? [];
    }
}
