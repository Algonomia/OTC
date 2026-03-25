import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapHas'
})
export class MapHasPipe implements PipeTransform {

    transform(map: Map<any, any>, key: any): boolean {
        return map.has(key);
    }

}
