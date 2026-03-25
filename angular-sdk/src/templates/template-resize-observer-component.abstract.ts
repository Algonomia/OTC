import {Directive, ElementRef, inject, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import { ATemplateComponent } from "./template-component.abstract";
import {Observable, of, Subject, switchMap} from 'rxjs';
import {debounceTime, startWith} from 'rxjs/operators';

@Directive()
export abstract class ATemplateWithResizablesComponent extends ATemplateComponent {
    @ViewChildren('resizableRef') resizables!: QueryList<ElementRef>;
    private resizeSubject = new Subject<ResizeObserverEntry[]>();
    private resizeObserver: ResizeObserver | null = isPlatformBrowser(inject(PLATFORM_ID))
        ? new ResizeObserver((entries: ResizeObserverEntry[]) => {
            this.resizeSubject.next(entries); // enables us to use debounce time to throttle many resize events
        })
        : null;

    // In order to use below function, please tag resizable objects you want to observe with #resizableRef
    resizeObservable(): Observable<ResizeObserverEntry[] | null> {
        if (!this.resizeObserver) {
            return of(null);
        }

        return this.pipeTakeUntil(this.resizables.changes).pipe(
            startWith(this.resizables),
            switchMap((resizeElements: QueryList<ElementRef>) => {
                this.resizeObserver!.disconnect();
                resizeElements.forEach((element: ElementRef) => {
                    this.resizeObserver!.observe(element.nativeElement);
                });
                return this.resizeSubject.asObservable();
            }),
            debounceTime(50)
        );
    }

    override ngOnDestroy() {
        super.ngOnDestroy();
        this.resizeObserver?.disconnect();
    }
}
