import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookiesService } from '../cookies/cookies.service';
import { WindowStrategyService } from '../window-strategy.service';
import { AuthLinkedinService } from './auth.linkedin.service';
import { GlobalEnvironment } from '../../../environments/otc-env';

describe('AuthLinkedinService', () => {
    let service: AuthLinkedinService;
    let mockCookiesService: jasmine.SpyObj<CookiesService>;

    const _logoutWidth = 600;
    const _logoutHeight = 500;
    const _logoutTimeout = 3000;

beforeEach(() => {
        mockCookiesService = jasmine.createSpyObj('CookiesService', ['getCookie', 'setCookie', 'deleteCookie']);
        mockCookiesService.getCookie.and.returnValue('');

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthLinkedinService,
                { provide: CookiesService, useValue: mockCookiesService }
            ]
        });

        service = TestBed.inject(AuthLinkedinService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('connect', () => {
        it('should be defined as a function', () => {
            expect(service.connect).toBeDefined();
            expect(typeof service.connect).toBe('function');
        });

        it('should have authorization URL configured correctly', () => {
            const authUrl = (service as any).authorizationUrl;

            expect(authUrl).toContain('https://www.linkedin.com/oauth/v2/authorization');
            expect(authUrl).toContain('response_type=code');
            expect(authUrl).toContain(`client_id=${GlobalEnvironment.linkedinClientId}`);
            expect(authUrl).toContain(`redirect_uri=${GlobalEnvironment.linkedinRedirectUri}`);
            expect(authUrl).toContain('scope=openid%20profile%20email');
            expect(authUrl).toContain('prompt=login');
        });

        it('should use environment linkedinClientId', () => {
            const authUrl = (service as any).authorizationUrl;
            expect(authUrl).toContain(GlobalEnvironment.linkedinClientId);
        });

        it('should use environment linkedinRedirectUri', () => {
            const authUrl = (service as any).authorizationUrl;
            expect(authUrl).toContain(GlobalEnvironment.linkedinRedirectUri);
        });
    });

    describe('disconnect', () => {
        let openPopupSpy: jasmine.Spy;
        let closeWindowSpy: jasmine.Spy;
        let mockWindow: Partial<Window>;

        beforeEach(() => {
            mockWindow = { close: jasmine.createSpy('close') };
            openPopupSpy = spyOn(WindowStrategyService, 'openPopupWindowCentered').and.returnValue(mockWindow as Window);
            closeWindowSpy = spyOn(WindowStrategyService, 'closeWindow');
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should open LinkedIn logout popup', () => {
            service.disconnect();

            expect(openPopupSpy).toHaveBeenCalledWith(
                'https://www.linkedin.com/m/logout',
                '_blank',
                _logoutWidth,
                _logoutHeight
            );
        });

        it('should close popup window after timeout', () => {
            service.disconnect();

            expect(closeWindowSpy).not.toHaveBeenCalled();

            jasmine.clock().tick(_logoutTimeout);

            expect(closeWindowSpy).toHaveBeenCalledWith(mockWindow as Window);
        });

        it('should call super disconnect after timeout', () => {
            service.disconnect();

            expect(mockCookiesService.deleteCookie).not.toHaveBeenCalled();

            jasmine.clock().tick(_logoutTimeout);

            expect(mockCookiesService.deleteCookie).toHaveBeenCalledWith('is_connected');
        });

        it('should use configured logout width', () => {
            service.disconnect();

            expect(openPopupSpy).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.any(String),
                _logoutWidth,
                jasmine.any(Number)
            );
        });

        it('should use configured logout height', () => {
            service.disconnect();

            expect(openPopupSpy).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.any(String),
                jasmine.any(Number),
                _logoutHeight
            );
        });

        it('should wait configured timeout before closing', () => {
            service.disconnect();

            jasmine.clock().tick(_logoutTimeout - 1);
            expect(closeWindowSpy).not.toHaveBeenCalled();

            jasmine.clock().tick(1);
            expect(closeWindowSpy).toHaveBeenCalled();
        });
    });

    describe('Inherited AuthProvider functionality', () => {
        it('should have isConnected property', () => {
            expect(service.isConnected).toBeDefined();
            expect(typeof service.isConnected).toBe('boolean');
        });

        it('should have userStatus observable from parent', () => {
            expect(service.userStatus$).toBeDefined();
        });

        it('should have isConnected$ observable from parent', () => {
            expect(service.isConnected$).toBeDefined();
        });

        it('should have getUserInfo observable from parent', () => {
            expect(service.getUserInfo$).toBeDefined();
        });
    });
});
