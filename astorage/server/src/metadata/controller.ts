import { Request, Response } from 'express';
import { getAllMetadata, getMetadata } from '../composites/metadata/getters';

export function getAllMetadataReq(_: Request, res: Response): void {
    try {
        const metadata = getAllMetadata();
        res.status(200).json(metadata);
    } catch (e: any) {
        console.error('getAllMetadata error:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export function getMetadataReq(req: Request<{}, {}, {ids: string[]}>, res: Response): void {
    try {
        const uuids = req.body.ids;
        const metadata = getMetadata(uuids);
        res.status(200).json(metadata);
    } catch (e: any) {
        console.error('getMetadata error:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
}
