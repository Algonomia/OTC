import { TestBed } from '@angular/core/testing';
import { CookiesService } from './cookies.service';

describe('CookiesService', () => {
    let service: CookiesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CookiesService);

        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setCookie', () => {
        it('should set a cookie with specified duration', () => {
            service.setCookie('test', 'cookie_value', 1);
            const cookieValue = service.getCookie('test');
            expect(cookieValue).toBe('cookie_value');
        });

        it('should set a cookie with duration in hours', () => {
            service.setCookie('hourTest', 'value', 24);
            expect(service.getCookie('hourTest')).toBe('value');
        });

        it('should delete a cookie when empty string is passed as value', () => {
            service.setCookie('testDelete', 'cookie_value', 1);
            expect(service.getCookie('testDelete')).toBe('cookie_value');

            service.setCookie('testDelete', '', 1);
            expect(service.getCookie('testDelete')).toBe('');
        });

        it('should handle cookie with special characters', () => {
            service.setCookie('specialTest', 'value-with_special.chars', 1);
            expect(service.getCookie('specialTest')).toBe('value-with_special.chars');
        });

        it('should overwrite existing cookie with same name', () => {
            service.setCookie('overwrite', 'firstValue', 1);
            expect(service.getCookie('overwrite')).toBe('firstValue');

            service.setCookie('overwrite', 'secondValue', 1);
            expect(service.getCookie('overwrite')).toBe('secondValue');
        });
    });

    describe('getCookie', () => {
        it('should return cookie value when cookie exists', () => {
            service.setCookie('existing', 'existingValue', 1);
            expect(service.getCookie('existing')).toBe('existingValue');
        });

        it('should return empty string when cookie does not exist', () => {
            const result = service.getCookie('nonExistent');
            expect(result).toBe('');
        });

        it('should return empty string for deleted cookie', () => {
            service.setCookie('deleted', 'value', 1);
            service.deleteCookie('deleted');
            expect(service.getCookie('deleted')).toBe('');
        });

        it('should handle cookie names with similar prefixes', () => {
            service.setCookie('user', 'value1', 1);
            service.setCookie('username', 'value2', 1);

            expect(service.getCookie('user')).toBe('value1');
            expect(service.getCookie('username')).toBe('value2');
        });
    });

    describe('deleteCookie', () => {
        it('should delete an existing cookie', () => {
            service.setCookie('toDelete', 'cookie_value', 1);
            expect(service.getCookie('toDelete')).toBe('cookie_value');

            service.deleteCookie('toDelete');
            expect(service.getCookie('toDelete')).toBe('');
        });

        it('should handle deleting a non-existent cookie', () => {
            service.deleteCookie('doesNotExist');
            expect(service.getCookie('doesNotExist')).toBe('');
        });

        it('should delete cookie by setting expiration to past date', () => {
            service.setCookie('expireTest', 'value', 1);
            const beforeDelete = service.getCookie('expireTest');
            expect(beforeDelete).toBe('value');

            service.deleteCookie('expireTest');
            const afterDelete = service.getCookie('expireTest');
            expect(afterDelete).toBe('');
        });
    });

    describe('setOneWeekCookie', () => {
        it('should set a cookie with one week duration', () => {
            service.setOneWeekCookie('weekCookie', 'weekValue');
            const cookieValue = service.getCookie('weekCookie');
            expect(cookieValue).toBe('weekValue');
        });

        it('should call setCookie with correct duration for one week', () => {
            spyOn(service, 'setCookie');
            service.setOneWeekCookie('weekTest', 'weekValue');
            expect(service.setCookie).toHaveBeenCalledWith('weekTest', 'weekValue', 168);
        });

        it('should handle empty value by deleting cookie', () => {
            service.setOneWeekCookie('emptyWeek', 'initialValue');
            expect(service.getCookie('emptyWeek')).toBe('initialValue');

            service.setOneWeekCookie('emptyWeek', '');
            expect(service.getCookie('emptyWeek')).toBe('');
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple cookies set at once', () => {
            service.setCookie('cookie1', 'value1', 1);
            service.setCookie('cookie2', 'value2', 1);
            service.setCookie('cookie3', 'value3', 1);

            expect(service.getCookie('cookie1')).toBe('value1');
            expect(service.getCookie('cookie2')).toBe('value2');
            expect(service.getCookie('cookie3')).toBe('value3');
        });

        it('should handle cookie name with spaces', () => {
            service.setCookie('cookie name', 'spaceValue', 1);
            expect(service.getCookie('cookie name')).toBe('spaceValue');
        });

        it('should return empty string for undefined cookie value', () => {
            const result = service.getCookie('undefinedCookie');
            expect(result).toBe('');
            expect(result).not.toBeUndefined();
            expect(result).not.toBeNull();
        });

        it('should handle very long cookie values', () => {
            const longValue = 'a'.repeat(1000);
            service.setCookie('longCookie', longValue, 1);
            expect(service.getCookie('longCookie')).toBe(longValue);
        });

        it('should handle cookie value with equals sign', () => {
            service.setCookie('equalsTest', 'value=withEquals', 1);
            expect(service.getCookie('equalsTest')).toBe('value=withEquals');
        });
    });
});
