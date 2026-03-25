import { Router } from 'express';
import { downloadFile, downloadZippedFiles, generateFilesUrls } from './download.controller';

const router = Router();

router.get('/download', downloadFile);
router.post('/download', downloadZippedFiles);
router.post('/presign', generateFilesUrls);

export default router;
