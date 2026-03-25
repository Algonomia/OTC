import db from '../common/database';
import { MALWARE_SCAN_STATUS } from "../common/malware_scan_status";
import { FileUtils, IFileMeta } from "@algonomia/ts-shared";

interface FileInput {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
    fieldname?: string;
    encoding?: string;
    destination?: string;
    filename?: string;
    path?: string;
}

const insertQuery = db.prepare(`
    INSERT INTO file_metadata (uuid, name, mimetype, extension, size, malware_scan, upload_date, additional_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING uuid, name, mimetype, extension, size, malware_scan, upload_date, additional_data
`);

export function createMetadata(
    uuid: string, 
    file: FileInput, 
    additionalData?: string, 
    malwareScan?: MALWARE_SCAN_STATUS
): IFileMeta {
    const name = file.originalname;
    const extension = FileUtils.getExtensionFromFileName(name);
    
    return insertQuery.get(
        uuid,
        name,
        file.mimetype,
        extension,
        file.size,
        malwareScan || MALWARE_SCAN_STATUS.PENDING,
        Date.now(),
        additionalData || null
    ) as IFileMeta;
};
