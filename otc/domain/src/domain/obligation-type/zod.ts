import {z} from 'zod';
import {EObligationTypeId} from './obligation-type';

export const ZObligationTypeIdSchema = z.nativeEnum(EObligationTypeId);
