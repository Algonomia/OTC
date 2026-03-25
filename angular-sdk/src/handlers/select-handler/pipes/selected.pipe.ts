import {Pipe, PipeTransform} from '@angular/core';
import {SelectHandler} from '../select-handler';

@Pipe({
    name: 'selected',
    standalone: true
})
export class SelectedPipe<T, ID> implements PipeTransform {
    constructor() {}

    transform(handler: SelectHandler<T, ID>, item: T) {
        return handler.isSelected$(item);
    }
}
