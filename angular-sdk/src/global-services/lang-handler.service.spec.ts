import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LangHandlerService } from './lang-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { QueryParamsSynchronizerService } from './query-params-synchronizer.service';
import { PLATFORM_ID } from '@angular/core';

interface MockTranslateService {
    setDefaultLang: jasmine.Spy;
    use: jasmine.Spy;
    currentLang: string | undefined;
    defaultLang: string;
    onLangChange: Observable<{ lang: string }>;
}

describe('LangHandlerService', () => {
    let service: LangHandlerService;
    let mockTranslateService: MockTranslateService;
    let mockQueryParamsSynchronizer: jasmine.SpyObj<QueryParamsSynchronizerService>;
    let onLangChange$: BehaviorSubject<{ lang: string }>;

    function setMockCurrentLang(value: string | undefined): void {
        Object.defineProperty(mockTranslateService, 'currentLang', { value, writable: true, configurable: true });
    }

    beforeEach(() => {
        onLangChange$ = new BehaviorSubject<{ lang: string }>({ lang: 'en' });

        mockTranslateService = {
            setDefaultLang: jasmine.createSpy('setDefaultLang'),
            use: jasmine.createSpy('use'),
            currentLang: undefined,
            defaultLang: 'en',
            onLangChange: onLangChange$.asObservable()
        };
        setMockCurrentLang('fr');

        mockQueryParamsSynchronizer = jasmine.createSpyObj('QueryParamsSynchronizerService',
            ['synchronize', 'updateKey']
        );
        mockQueryParamsSynchronizer.synchronize.and.returnValue(of(undefined));

        TestBed.configureTestingModule({
            providers: [
                LangHandlerService,
                { provide: TranslateService, useValue: mockTranslateService },
                { provide: QueryParamsSynchronizerService, useValue: mockQueryParamsSynchronizer },
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });

        service = TestBed.inject(LangHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should set default language to en on init', () => {
            expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
        });

        it('should call synchronize with correct key', () => {
            expect(mockQueryParamsSynchronizer.synchronize).toHaveBeenCalled();
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            expect(args[0]).toBe('lang');
        });

        it('should call synchronize with subject observable', () => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            expect(args[1]).toBeDefined();
            expect(args[1] instanceof Observable).toBe(true);
        });

        it('should call synchronize with reaction function', () => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            expect(args[2]).toBeInstanceOf(Function);
        });

        it('should subscribe to synchronize result', () => {
            expect(mockQueryParamsSynchronizer.synchronize).toHaveBeenCalled();
        });
    });

    describe('Language Change Reaction', () => {
        let reaction: ((lang: string | undefined) => void) | Function;

        beforeEach(() => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            reaction = args[2] as (lang: string | undefined) => void;
        });

        it('should call translate use when reaction receives a language', () => {
            reaction('fr');
            expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
        });

        it('should call translate use when reaction receives different language', () => {
            reaction('en');
            expect(mockTranslateService.use).toHaveBeenCalledWith('en');
        });

        it('should call updateKey when reaction receives undefined', () => {
            setMockCurrentLang('fr');
            reaction(undefined);
            expect(mockQueryParamsSynchronizer.updateKey).toHaveBeenCalledWith('lang', 'fr');
        });

        it('should updateKey with defaultLang if currentLang is not set', () => {
            setMockCurrentLang(undefined);
            reaction(undefined);
            expect(mockQueryParamsSynchronizer.updateKey).toHaveBeenCalledWith('lang', 'en');
        });

        it('should not call translate use when reaction receives undefined', () => {
            (mockTranslateService.use as jasmine.Spy).calls.reset();
            reaction(undefined);
            expect(mockTranslateService.use).not.toHaveBeenCalled();
        });

        it('should not call updateKey when reaction receives a defined language', () => {
            mockQueryParamsSynchronizer.updateKey.calls.reset();
            reaction('de');
            expect(mockQueryParamsSynchronizer.updateKey).not.toHaveBeenCalled();
        });
    });

    describe('Observable Subject Mapping', () => {
        it('should map onLangChange to currentLang', (done) => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            const subject$ = args[1] as Observable<string>;

            setMockCurrentLang('de');
            onLangChange$.next({ lang: 'de' });

            subject$.subscribe(lang => {
                expect(lang).toBe('de');
                done();
            });
        });

        it('should map onLangChange to defaultLang when currentLang is undefined', (done) => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            const subject$ = args[1] as Observable<string>;

            setMockCurrentLang(undefined);
            onLangChange$.next({ lang: 'en' });

            subject$.subscribe(lang => {
                expect(lang).toBe('en');
                done();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string language in reaction', () => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            const reaction = args[2];

            (mockTranslateService.use as jasmine.Spy).calls.reset();
            reaction('');

            expect(mockTranslateService.use).not.toHaveBeenCalled();
        });

        it('should handle null language in reaction', () => {
            const args = mockQueryParamsSynchronizer.synchronize.calls.mostRecent().args;
            const reaction = args[2];

            setMockCurrentLang('fr');
            reaction(null as any);

            expect(mockQueryParamsSynchronizer.updateKey).toHaveBeenCalledWith('lang', 'fr');
        });
    });
});
