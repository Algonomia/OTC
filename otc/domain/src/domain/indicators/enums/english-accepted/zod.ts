import {z} from 'zod';
import {EEnglishAcceptedId} from './english-accepted';

export const ZEnglishAcceptedIdSchema = z.nativeEnum(EEnglishAcceptedId);
