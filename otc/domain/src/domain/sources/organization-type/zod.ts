import {z} from 'zod';
import {EOrganizationTypeId} from './organization-type';

export const ZOrganizationTypeIdSchema = z.nativeEnum(EOrganizationTypeId);
