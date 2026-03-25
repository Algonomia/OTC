import {Pipe, PipeTransform} from '@angular/core';
import {TJsonObject, NullUndefinedUtils, ZJsonObject} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Pipe({
    name: 'jsonStringify',
    standalone: true
})
export class JsonStringifyPipe implements PipeTransform {
    transform(value: TJsonObject | null): string | null {
        if (isNullOrUndefined(value)) {
            return null;
        }
        if (!!ZJsonObject.safeParse(value)?.error) {
            return String(value);
        }
        try {
            return JSON.stringify(value);
        } catch {
            return '';
        }
    }
}
