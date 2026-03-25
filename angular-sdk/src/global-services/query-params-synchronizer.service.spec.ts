import {BehaviorSubject, firstValueFrom, map, take} from 'rxjs';
import {TestBed} from '@angular/core/testing';
import {QueryParamsSynchronizerService} from './query-params-synchronizer.service';
import {ActivatedRoute, Router} from '@angular/router';

const queryParams$ = new BehaviorSubject<{ [key: string]: any }>({});

describe('QueryParamsSynchronizer', () => {
    let service: QueryParamsSynchronizerService;
    let routerMock: { navigate: jasmine.Spy };
    let activatedRouteMock: { queryParams: any; snapshot: { queryParams: any } };

    beforeEach(() => {
        routerMock = { navigate: jasmine.createSpy('navigate') };
        activatedRouteMock = {
            queryParams: queryParams$.asObservable(),
            snapshot: { queryParams: {} }
        };
        queryParams$.next({});

        TestBed.configureTestingModule({
            providers: [
                QueryParamsSynchronizerService,
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock }
            ]
        });

        service = TestBed.inject(QueryParamsSynchronizerService);
    });

    it('should emit undefined when query param does not exist', async () => {
        const value = await firstValueFrom(
            service.queryListener('test')
        );

        expect(value).toBeUndefined();
    });

    it('should emit value when query param changes', async () => {
        const observable = service.queryListener('foo').pipe(
            take(1)
        );

        queryParams$.next({ foo: 'bar' });
        const value = await firstValueFrom(observable);
        expect(value).toBe('bar');
    });

    it('should call router.navigate when updateKey is called with a new value', async () => {
        activatedRouteMock.snapshot.queryParams = {};
        service.updateKey('foo', 'bar');

        await new Promise(resolve => setTimeout(resolve, 250));

        expect(routerMock.navigate).toHaveBeenCalledWith([], {
            queryParams: { foo: 'bar' },
            queryParamsHandling: 'merge',
            replaceUrl: true
        });
    });

    it('should not call router.navigate if the value is the same as current', async () => {
        activatedRouteMock.snapshot.queryParams = { foo: 'bar' };

        service.updateKey('foo', 'bar');

        await new Promise(resolve => setTimeout(resolve, 250));

        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('synchronize should call reaction when query param changes', async () => {
        const reaction = jasmine.createSpy('reaction');
        const obs$ = service.synchronize('foo', queryParams$.asObservable().pipe(map(params => params['foo'])), reaction);
        const subscription = obs$.subscribe();

        queryParams$.next({ foo: 'baz' });

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(reaction).toHaveBeenCalledWith('baz');
        subscription.unsubscribe();
    });

    it('synchronize should update query param when external observable emits', async () => {
        const external$ = new BehaviorSubject<string | undefined>(undefined);

        const obs$ = service.synchronize('foo', external$, () => {});
        obs$.subscribe();

        external$.next('newValue');

        await new Promise(resolve => setTimeout(resolve, 250));

        expect(routerMock.navigate).toHaveBeenCalledWith([], {
            queryParams: { foo: 'newValue' },
            queryParamsHandling: 'merge',
            replaceUrl: true
        });
    });

    it('queryListener should replay the last emitted value', async () => {
        queryParams$.next({ foo: 'replayTest' });

        const value = await firstValueFrom(service.queryListener('foo'));

        expect(value).toBe('replayTest');
    });
});
