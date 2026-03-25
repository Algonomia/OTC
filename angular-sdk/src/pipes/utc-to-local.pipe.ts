import { Pipe, PipeTransform } from '@angular/core';
import {DateUtils} from '@algonomia/ts-shared';

@Pipe({
  name: 'utcToLocal',
  standalone: true
})
export class UtcToLocalPipe implements PipeTransform {
    transform(date?: Date | null): unknown {
        return DateUtils.utcToLocal(date);
    }
}
