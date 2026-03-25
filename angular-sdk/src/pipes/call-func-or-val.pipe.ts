import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'callFuncOrVal',
  standalone: true
})
export class CallFuncOrValPipe implements PipeTransform {
    transform<T>(value: T  | ((...args: any[]) => T), ...args: any[]): T {
        try {
            return (value as ((...args: any[]) => T))(...args);
        } catch {
            return value as T;
        }
    }
}
