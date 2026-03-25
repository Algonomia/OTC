import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {map, of, startWith} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TranslateWrapperService extends TranslateService {

    get_arr(values: string | string[], joinStr: string = ' - ') {
        return this.onLangChange.pipe(
            startWith(null),
            map(_ => {
                return this.instant_arr(values, joinStr)
            })
        )
    }

    instant_arr(values: string | string[], joinStr: string = ' - ') {
        if (Array.isArray(values)) {
            return values.map(x => this.instant(x)).filter(Boolean).join(joinStr)
        }
        return this.instant(values);
    }

    override get(value: string) {
        if (!value) {
            return of('');
        }
        return super.get(value);
    }

    override instant(value: string) {
        if (!value) {
            return '';
        }
        return super.instant(value);
    }
}

@Pipe({
    name: 'translate_arr',
    standalone: true
})
export class TranslateArrPipe implements PipeTransform {

    constructor(private _translateWrapperService: TranslateWrapperService) {}

    transform(values: string | string[]) {
        return this._translateWrapperService.get_arr(values);
    }
}
