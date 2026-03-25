import db from '../common/database';
import {IFileMeta} from '@algonomia/ts-shared';
import {MALWARE_SCAN_STATUS} from '../common/malware_scan_status';

const updateErrorQuery = db.prepare(`
    UPDATE file_metadata
    SET error = ?
    WHERE uuid = ?
    RETURNING *
`);

const updateMalwareScanQuery = db.prepare(`
    UPDATE file_metadata
    SET malware_scan = ?
    WHERE uuid = ?
    RETURNING *
`);

export function updateError(uuid: string, error: string): IFileMeta {
    return updateErrorQuery.get(error, uuid) as IFileMeta;
}

export function updateMalwareScan(uuid: string, malwareScan: MALWARE_SCAN_STATUS): IFileMeta {
    return updateMalwareScanQuery.get(malwareScan, uuid) as IFileMeta;
}
