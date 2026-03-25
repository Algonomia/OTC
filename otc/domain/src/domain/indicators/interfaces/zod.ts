import {z} from 'zod';
import {EIndicatorId} from './interfaces';

export const ZIndicatorIdSchema = z.nativeEnum(EIndicatorId);
