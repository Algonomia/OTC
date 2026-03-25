import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'valueToArray',
    standalone: true
})
export class ValueToArrayPipe implements PipeTransform {
    transform<T>(value: T): T[] {
        return [value];
    }
}
