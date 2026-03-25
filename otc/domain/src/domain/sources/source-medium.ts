import {IFileWithUUID} from '@algonomia/ts-shared';

export interface ISourceMedium {
    link?: string;
    files?: IFileWithUUID[];
}

export interface ISourceMediumRef {
    link?: string;
    file_uuids?: string[];
}
