import { Router } from 'express';
import { getAllMetadataReq, getMetadataReq } from './controller';

const router = Router();

router.get('/metadata', getAllMetadataReq);
router.post('/metadata', getMetadataReq);

export default router;
