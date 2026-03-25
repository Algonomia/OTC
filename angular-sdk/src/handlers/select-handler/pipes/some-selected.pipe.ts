import {Pipe, PipeTransform} from '@angular/core';
import {SelectHandler} from '../select-handler';

@Pipe({
    name: 'someSelected',
    standalone: true
})
export class SomeSelectedPipe<T, ID> implements PipeTransform {
    constructor() {}

    transform(handler: SelectHandler<T, ID>, items: T[]) {
        return handler.someSelected$(items);
    }
}
