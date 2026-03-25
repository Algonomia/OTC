import {z} from 'zod';
import {EScopeOfObligationId} from './scope-of-obligation';

export const ZScopeOfObligationIdSchema = z.nativeEnum(EScopeOfObligationId);
