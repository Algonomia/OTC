import {Pipe, PipeTransform} from '@angular/core';
import {SelectHandler} from '../select-handler';

@Pipe({
    name: 'selectedState',
    standalone: true
})
export class SelectedStatePipe<T, ID> implements PipeTransform {
    constructor() {}

    transform(handler: SelectHandler<T, ID>) {
        return handler.selectedState$;
    }
}
