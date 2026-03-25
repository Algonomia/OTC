import {Pipe, PipeTransform} from '@angular/core';
import {SelectHandler} from '../select-handler';
import {of} from 'rxjs';

@Pipe({
    name: 'selectList',
    standalone: true
})
export class SelectListPipe<T, ID> implements PipeTransform {
    constructor() {}

    transform(handler?: SelectHandler<T, ID>) {
        return handler?.list$ ?? of([]);
    }
}
