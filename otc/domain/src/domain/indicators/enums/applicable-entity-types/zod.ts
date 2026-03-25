import {z} from 'zod';
import {EApplicableEntityTypeId} from './applicable-entity-types';

export const ZApplicableEntityTypeIdSchema = z.nativeEnum(EApplicableEntityTypeId);
