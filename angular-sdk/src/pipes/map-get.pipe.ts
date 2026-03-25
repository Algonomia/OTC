import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapGet'
})
export class MapGetPipe implements PipeTransform {

    transform<K, V>(map: Map<K, V>, key: K): V | undefined {
        return map.get(key);
    }

}
