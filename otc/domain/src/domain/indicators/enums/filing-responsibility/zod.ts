import {z} from 'zod';
import {EFilingResponsibilityId} from './filing-responsibility';

export const ZFilingResponsibilitySchema = z.nativeEnum(EFilingResponsibilityId);
