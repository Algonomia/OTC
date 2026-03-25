import {z} from 'zod';
import {EIsObligationInPlaceId} from './is-obligation-in-place';

export const ZIsObligationInPlaceSchema = z.nativeEnum(EIsObligationInPlaceId);
