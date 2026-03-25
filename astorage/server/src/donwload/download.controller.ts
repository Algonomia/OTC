import {Request, Response} from 'express';
import {IFileMeta} from '@algonomia/ts-shared';
import {getReadStream} from '../composites/streams/read';
import {updateError} from '../composites/metadata/update';
import {getMetadata} from '../composites/metadata/getters';
import {getPath} from '../composites/common/paths';
import {createZip} from '../composites/common/zip';

export async function downloadFile(req: Request<{}, {}, {}, {uuid: string}>, res: Response): Promise<void> {
    const fileUUID = req.query.uuid as string;

    if (!fileUUID) {
        res.status(400).json({message: 'UUID parameter is required'});
        return;
    }

    try {
        const metadata = _getFileMetadata(fileUUID);
        _setResponseHeader(res, metadata.mimetype, metadata.name);
        getReadStream(fileUUID).pipe(res);
    } catch (e: any) {
        const updatedError = updateError(fileUUID, 'Failed to read file');

        console.error('sendMedia', e);
        res.status(500).json(updatedError);
    }
}

export async function downloadZippedFiles(req: Request<{}, {}, {uuids: string[]}>, res: Response): Promise<void> {
    const uuids = req.body.uuids || [];
    if (!Array.isArray(uuids) || uuids.length === 0) {
        res.status(400).json({message: 'uuids must be a non-empty array'});
        return;
    }

    const metadata = getMetadata(uuids);
    if (metadata.length === 0) {
        res.status(404).json({message: 'No files found for the provided uuids'});
        return;
    }

    try {
        _setResponseHeader(res, 'application/zip', 'files.zip');
        const zip = await _getZip(metadata);
        zip.pipe(res);
        zip.finalize();
    } catch (e: any) {
        console.error('getZippedFiles', e);
        res.status(500).json({message: 'Internal server error'});
    }
}

export function generateFilesUrls(req: Request<{}, {}, { uuids: string[] }>, res: Response) {
    const { uuids } = req.body;
    if (!Array.isArray(uuids) || uuids.length === 0) {
        return res.status(400).json({ error: 'uuids must be a non-empty array' });
    }
    const urls = uuids.map((file_uuid: string) => {
        return `${req.protocol}://${process.env.HOST}/download?uuid=${file_uuid}`;
    });

    return res.status(200).json({ urls });
}

function _getFileMetadata(uuid: string): IFileMeta {
    const metadata = getMetadata(uuid)[0];

    if (!metadata) {
        throw new Error(`Metadata not found for uuid: ${uuid}`);
    }

    return metadata;
}

function _setResponseHeader(response: Response, mimetype: string, name: string): void {
    response.setHeader('Content-Type', mimetype || 'application/octet-stream');
    response.setHeader('Content-Disposition', `attachment; filename="${name}"`);
}

async function _getZip(metadata: IFileMeta[]): Promise<any> {
    const pathNames = metadata.map(metadatum => ({
        path: getPath(metadatum.uuid),
        name: metadatum.name
    }));

    return createZip(pathNames);
}