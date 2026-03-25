import { Pipe, PipeTransform } from '@angular/core';
import {FileUtils} from '@algonomia/ts-shared';

@Pipe({
    name: 'fileSize',
    standalone: true
})
export class FileSizePipe implements PipeTransform {
    transform(bytes: number, decimals: number = 2): string {
        return FileUtils.convertFileSize(bytes, decimals);
    }
}
