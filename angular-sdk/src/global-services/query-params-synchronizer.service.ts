import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    buffer,
    debounceTime,
    distinctUntilChanged,
    map, merge,
    Observable,
    ReplaySubject,
    share,
    Subject,
    tap
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsSynchronizerService {
    private _askForUpdate = new Subject<{[key: string]: string | undefined}>();
    constructor(private _router: Router, private _route: ActivatedRoute) {
        this._askForUpdate.pipe(buffer(this._askForUpdate.pipe(debounceTime(200)))).subscribe(paramss => {
            this._router.navigate([], {
                queryParams: Object.assign({}, ...paramss),
                queryParamsHandling: 'merge',
                replaceUrl: true
            });
        });
    }

    synchronize(key: string, subject: Observable<string | undefined>, reaction: Function) {
        return merge(
            this.queryListener(key).pipe(tap(value => {
                reaction(value)
            })),
            subject.pipe(distinctUntilChanged(), tap((value => {
                this.updateKey(key, value);
            })))
        );
    }

    updateKey(key: string, value: string | undefined) {
        const current = this._route.snapshot.queryParams[key] || null;
        if (value !== current) {
            const queryParams: {[key: string]: string | undefined} = {};
            queryParams[key] = value;
            this._askForUpdate.next(queryParams);
        }
    }

    queryListener(key: string) {
        return this._queryListener(key);
    }

    private _mapQueryListeners: Map<string, Observable<string>> = new Map();
    private _queryListener(key: string) {
        if (!this._mapQueryListeners.has(key)) {
            this._mapQueryListeners.set(key, this._route.queryParams.pipe(
                map(params => params.hasOwnProperty(key) ? params[key] : undefined),
                distinctUntilChanged((a, b) => a === b),
                share({connector: () => new ReplaySubject(1)})
            ));
        }
        return this._mapQueryListeners.get(key) as Observable<string>;
    }
}
