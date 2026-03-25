import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HeaderComponent} from './header.component';
import {TranslateModule} from '@ngx-translate/core';
import {provideRouter, Router, ActivationEnd, ActivatedRouteSnapshot} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {HeaderRoutes} from '../../global-services/get-link-strategy.service';
import {Component} from '@angular/core';

@Component({
    template: '',
    standalone: true
})
class DummyComponent {}

describe('HeaderComponent', () => {
    const debounce_time = 100;

    let fixture: ComponentFixture<HeaderComponent>;
    let component: HeaderComponent;
    let router: Router;

    const mockRoutes: HeaderRoutes[] = [
        { path: 'dashboard', title: 'Dashboard' },
        { path: 'sources', title: 'Sources' },
        { path: 'contributions', title: 'Contributions', hasConnectionGuard: true },
    ];

    function mockGetLinksCallback(): (router: Router) => HeaderRoutes[] {
        return () => mockRoutes;
    }

    function emitActivationEnd() {
        const snapshot = {url: [], params: {}, queryParams: {}, data: {}} as unknown as ActivatedRouteSnapshot;
        (router.events as any).next(new ActivationEnd(snapshot));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent, TranslateModule.forRoot()],
            providers: [
                provideRouter([
                    { path: 'dashboard', component: DummyComponent },
                    { path: 'sources', component: DummyComponent },
                    { path: 'contributions', component: DummyComponent },
                    { path: '**', component: DummyComponent },
                ]),
                provideNoopAnimations(),
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
    });

    describe('Route updates on navigation', () => {
        it('should populate header routes using getLinksCallback after init', fakeAsync(() => {
            fixture.componentRef.setInput('getLinksCallback', mockGetLinksCallback());
            fixture.detectChanges();

            tick(debounce_time);

            expect(component.__headerRoutes).toEqual(mockRoutes);
        }));

        it('should use a custom getLinksCallback when provided', fakeAsync(() => {
            const customRoutes: HeaderRoutes[] = [{ path: 'custom', title: 'Custom' }];
            fixture.componentRef.setInput('getLinksCallback', () => customRoutes);
            fixture.detectChanges();

            tick(debounce_time);

            expect(component.__headerRoutes).toEqual(customRoutes);
        }));

        it('should refresh routes on ActivationEnd event', fakeAsync(() => {
            let callCount = 0;
            fixture.componentRef.setInput('getLinksCallback', () => {
                callCount++;
                return mockRoutes;
            });
            fixture.detectChanges();
            tick(debounce_time);

            const initialCallCount = callCount;
            emitActivationEnd();
            tick(debounce_time);

            expect(callCount).toBeGreaterThan(initialCallCount);
        }));
    });

    describe('Current route title resolution', () => {
        it('should resolve current route title from matching route', fakeAsync(() => {
            fixture.componentRef.setInput('getLinksCallback', mockGetLinksCallback());
            fixture.detectChanges();
            tick(debounce_time);

            router.navigateByUrl('/dashboard');
            tick();
            emitActivationEnd();
            tick(debounce_time);

            expect(component.__currentRouteTitle).toBe('Dashboard');
        }));

        it('should return empty string when no route matches', fakeAsync(() => {
            fixture.componentRef.setInput('getLinksCallback', mockGetLinksCallback());
            fixture.detectChanges();
            tick(debounce_time);

            router.navigateByUrl('/unknown');
            tick();
            emitActivationEnd();
            tick(debounce_time);

            expect(component.__currentRouteTitle).toBe('');
        }));

        it('should update title when navigating between routes', fakeAsync(() => {
            fixture.componentRef.setInput('getLinksCallback', mockGetLinksCallback());
            fixture.detectChanges();
            tick(debounce_time);

            router.navigateByUrl('/dashboard');
            tick();
            emitActivationEnd();
            tick(debounce_time);
            expect(component.__currentRouteTitle).toBe('Dashboard');

            router.navigateByUrl('/sources');
            tick();
            emitActivationEnd();
            tick(debounce_time);
            expect(component.__currentRouteTitle).toBe('Sources');
        }));
    });

    describe('Mobile menu toggle', () => {
        it('should start with menu closed', () => {
            expect(component.show_menu_mobile).toBe(false);
        });

        it('should toggle menu state', () => {
            component.show_menu_mobile = !component.show_menu_mobile;
            expect(component.show_menu_mobile).toBe(true);

            component.show_menu_mobile = !component.show_menu_mobile;
            expect(component.show_menu_mobile).toBe(false);
        });
    });
});
