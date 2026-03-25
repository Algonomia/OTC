import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrStronglyIncludes',
  standalone: true
})
export class ArrStronglyIncludesPipe implements PipeTransform {
    transform(arr_1: unknown[] = [], arr_2: unknown[] = []): unknown {
        return arr_2.every((x, i) => x === arr_1[i]);
    }
}
