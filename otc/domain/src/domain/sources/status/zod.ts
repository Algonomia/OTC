import {z} from 'zod';
import {ESourceStatus} from './source-status';

export const ZSourceStatusSchema = z.nativeEnum(ESourceStatus);
