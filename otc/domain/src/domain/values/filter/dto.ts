import {z} from 'zod';
import {TPartialFilterValueHTTP, IFilterValuesUI, ZFilterValues} from './interface';
import {DateUtils, AFrontToBackDTO, NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

export class FilterValuesDTO extends AFrontToBackDTO<TPartialFilterValueHTTP, IFilterValuesUI, z.ZodType<TPartialFilterValueHTTP>>{
    readonly uri: string = 'values';
    protected __schema = ZFilterValues;

    protected __toBack(arr: IFilterValuesUI[]): TPartialFilterValueHTTP[] {
        return arr.map(x => ({
            minReliability: isNullOrUndefined(x.minReliability) ? undefined : x.minReliability!,
            priority: isNullOrUndefined(x.priority) ? undefined : x.priority!,
            jurisdictions: isNullOrUndefined(x.jurisdictions) ? undefined : x.jurisdictions!,
            obligationTypeIds: isNullOrUndefined(x.obligationTypeIds) ? undefined : x.obligationTypeIds!,
            sourcesIds: isNullOrUndefined(x.sources) ? undefined : x.sources?.map(x => x.source_id)!,
            minVersion: DateUtils.dateToStdString(x.minVersion),
            maxVersion: DateUtils.dateToStdString(x.maxVersion)
        }));
    }
}
