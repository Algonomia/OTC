import {Pipe, PipeTransform} from '@angular/core';
import {SelectHandler} from '../select-handler';

@Pipe({
    name: 'selectDisplayValue',
    standalone: true
})
export class SelectDisplayValuePipe<T, ID> implements PipeTransform {
    constructor() {}

    transform(handler: SelectHandler<T, ID>, item: T) {
        return handler.displayValue$(item);
    }
}
