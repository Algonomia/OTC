import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'setHas'
})
export class SetHasPipe implements PipeTransform {

    transform(set: Set<any>, key: any): boolean {
        return set.has(key);
    }

}
