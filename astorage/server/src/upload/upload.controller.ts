import {Request, Response} from 'express';
import {v7 as uuidv7} from 'uuid';
import {MALWARE_SCAN_STATUS} from '../composites/common/malware_scan_status';
import {LARGE_FILE_THRESHOLD} from '../composites/common/sizes';
import {createMetadata} from '../composites/metadata/create';
import {updateMalwareScan} from '../composites/metadata/update';
import {scanFile} from '../composites/malware/scan';
import {IFileMeta} from '@algonomia/ts-shared';
import {Stream} from '../composites/streams/stream.namespace';

export const uploadFiles = async (req: Request<{}, {}, {additionalData: string}>, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        const additionalData = req.body.additionalData ? JSON.parse(req.body.additionalData) : [];

        if (!Array.isArray(additionalData)) {
            res.status(400).json({message: 'additionalData must be an array'});
            return;
        }

        if (!files || !Array.isArray(files)) {
            res.status(400).json({message: 'No files uploaded'});
            return;
        }

        const metadata = await Promise.all(
            files.map((file, idx) => _upload(file, additionalData[idx]))
        );
        res.status(200).json(metadata);
    } catch (e: any) {
        console.error('uploadFiles', e);
        res.status(500).json({message: 'Internal server error'});
    }
}

async function _upload(file: Express.Multer.File, additionalData: string): Promise<IFileMeta | {error: string}> {
    const uuid = uuidv7();

    try {
        await Stream.write(uuid, file.buffer);

        if (file.size > LARGE_FILE_THRESHOLD) {
            return _handleLargeFileUpload(uuid, file, additionalData);
        } else {
            return _handleSmallFileUpload(uuid, file, additionalData);
        }
    } catch (error: any) {
        console.error('processFileUpload error:', error);
        return {error: `Failed to upload file ${file.originalname}: ${error.message}`}
    }
}

async function _handleLargeFileUpload(uuid: string, file: Express.Multer.File, additionalData: string): Promise<IFileMeta> {
    const createdFile = createMetadata(uuid, file, additionalData, MALWARE_SCAN_STATUS.PENDING);

    scanFile(uuid).then((scanStatus: MALWARE_SCAN_STATUS) => {
        updateMalwareScan(uuid, scanStatus);
        if (scanStatus === MALWARE_SCAN_STATUS.INFECTED) {
            Stream.deleteFile(uuid);
        }
    });

    return createdFile;
}

async function _handleSmallFileUpload(uuid: string, file: Express.Multer.File, additionalData: string): Promise<IFileMeta> {
    const malwareScan = await scanFile(uuid);
    return createMetadata(uuid, file, additionalData, malwareScan);
}


