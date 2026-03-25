import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'concatStr'
})
export class ConcatStrPipe implements PipeTransform {

    transform(v1: string, v2: string): string {
        return `${v1}${v2}`;
    }

}
