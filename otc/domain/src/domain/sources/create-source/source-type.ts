import {z} from 'zod';

export enum ESourceType {
    URL = 'URL',
    FILES = 'FILES'
}

export const ZSourceTypeSchema = z.nativeEnum(ESourceType);

export interface ISourceType {
    source_type: ESourceType;
}
