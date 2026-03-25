import db from '../common/database';
import {IFileMeta} from '@algonomia/ts-shared';

const getAllQuery = db.prepare(`SELECT * FROM file_metadata`);
const getSomeQuery = db.prepare(`
    SELECT * FROM file_metadata
    WHERE uuid IN (SELECT value FROM json_each(?))
`);

export function getAllMetadata(): IFileMeta[] {
    return getAllQuery.all() as IFileMeta[];
}

export function getMetadata(uuids: string | string[]): IFileMeta[] {
    if (!uuids) return [];
    
    const uuidArray: string[] = Array.isArray(uuids) ? uuids : [uuids];
    
    if (uuidArray.length === 0) return [];
    
    return getSomeQuery.all(JSON.stringify(uuidArray)) as IFileMeta[];
}
