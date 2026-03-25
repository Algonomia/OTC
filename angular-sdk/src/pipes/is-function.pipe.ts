import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isFunction',
  standalone: true
})
export class IsFunctionPipe implements PipeTransform {
    transform(value: unknown): unknown {
        return value instanceof Function;
    }
}
