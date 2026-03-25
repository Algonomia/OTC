import {z} from 'zod';
import {ESubmissionMethodId} from './submission-method';

export const ZSubmissionMethodIdSchema = z.nativeEnum(ESubmissionMethodId);
