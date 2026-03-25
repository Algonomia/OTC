import { Router } from 'express';
import multer from 'multer';
import { uploadFiles } from './upload.controller';
import {FileUtils} from '@algonomia/ts-shared';

const router = Router();

const upload = multer({
    limits: {
        fileSize: parseInt(process.env.MAX_UPLOAD_SIZE || '1000') * FileUtils.MB
    }
});

router.post('/upload', upload.array('files'), uploadFiles);

export default router;
