import { Pipe, PipeTransform } from '@angular/core';
import {ComplexValueUtils, TComplexValue, IScope, ITag} from '@algonomia/ts-shared';

@Pipe({
    name: 'displayComplexValue',
    standalone: true
})
export class DisplayComplexValuePipe implements PipeTransform {
    constructor() {}

    transform(complexValue?: TComplexValue | null, tags: ITag[] = [], scopes: IScope[] = []) {
        if (!complexValue) {
            return '';
        }
        return ComplexValueUtils.display(complexValue, tags, scopes);
    }
}
