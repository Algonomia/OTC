import {Directive, OnDestroy} from '@angular/core';
import {Observable, Subject, switchMap, takeUntil} from 'rxjs';

@Directive()
export abstract class ATemplateComponent implements OnDestroy {
    private _stopSubject$ = new Subject<void>();

    pipeTakeUntil<D>(subject: Observable<D>) {
        return subject.pipe(takeUntil(this._stopSubject$));
    }

    protected __onDestroy() {}

    ngOnDestroy() {
        this.__onDestroy();
        this._stopSubject$.next();
        this._stopSubject$.complete();
    }
}

@Directive()
export abstract class ATemplateWithRebootComponent extends ATemplateComponent {
    protected __rebootSubject$ = new Subject<void>();

    pipeTakeUntilOrReboot<D>(subject: Observable<D>) {
        return this.pipeTakeUntil(subject).pipe(takeUntil(this.__rebootSubject$));
    }

    override ngOnDestroy() {
        super.ngOnDestroy();
        this.__rebootSubject$.next();
        this.__rebootSubject$.complete();
    }
}
