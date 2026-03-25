import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {
    private _dayMs = 24 * 60 * 60 * 1000;
    private _dayToHours = 24;
    private _weekToHours = 7 * this._dayToHours;
    private _hoursToMs = 60 * 60 * 1000;
    private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    constructor() { }

    setOneWeekCookie(name: string, val: string) {
        this.setCookie(name, val, this._weekToHours);
    }

    setCookie(name: string, val: string, duration: number) {
        if (!this._isBrowser) {
            return;
        }

        if (val === '') {
            this.deleteCookie(name);
            return;
        }
        const date = new Date();
        date.setTime(date.getTime() + (duration * this._hoursToMs));
        document.cookie = name + '=' + val + '; expires=' + date.toUTCString() + '; path=/';
    }

    getCookie(name: string) {
        if (!this._isBrowser) {
            return '';
        }

        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift();
        } else {
            return '';
        }
    }

    deleteCookie(name: string) {
        if (!this._isBrowser) {
            return;
        }

        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() - this._dayMs);

        // Set it
        document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
    }
}
