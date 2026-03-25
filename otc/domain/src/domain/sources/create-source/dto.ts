import {z} from 'zod';
import {AFrontToBackDTO} from '@algonomia/ts-shared';
import {TCreateLinkSources, THTTPCreateLinkSources, ZCreateLinkSourcesSchema} from './from-link';
import {TCreateFileSources, THTTPCreateFileSources, ZCreateFileSourcesSchema} from './from-files';

export class CreateLinkSourceDTO extends AFrontToBackDTO<THTTPCreateLinkSources, TCreateLinkSources, z.ZodType<THTTPCreateLinkSources>>{
    readonly uri: string = 'sources';
    protected __schema = ZCreateLinkSourcesSchema;

    protected __toBack(arr: TCreateLinkSources[]): THTTPCreateLinkSources[] {
        return arr.map(x => ({
            ...x, date_of_publication: x.date_of_publication?.getTime()
        }));
    }
}

export class CreateFileSourceDTO extends AFrontToBackDTO<THTTPCreateFileSources, TCreateFileSources, z.ZodType<THTTPCreateFileSources>>{
    readonly uri: string = 'sources';
    protected __schema = ZCreateFileSourcesSchema;

    protected __toBack(arr: TCreateFileSources[]): THTTPCreateFileSources[] {
        return arr.map(x => ({
            ...x, date_of_publication: x.date_of_publication?.getTime()
        }));
    }
}
