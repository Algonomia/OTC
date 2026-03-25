import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from "rxjs";

export interface WindowWidthHeight {
    width: number;
    height: number;
}

export enum ScreenSize { small = 'small', intermediary = 'intermediary', normal = 'normal' }

@Injectable({
    providedIn: 'root'
})
export class WidthHeightListenerService {
    private static _breakpoint_tablet_l: number = 970;
    private static _breakpoint_laptop: number = 1200;

    private static _windowSizeListener = new BehaviorSubject<WindowWidthHeight>(
        WidthHeightListenerService._getWindowWidthHeight()
    );

    private static _getWindowWidthHeight(): WindowWidthHeight {
        return {width: window.innerWidth, height: window.innerHeight};
    }

    static get windowSizeListener() {
        return this._windowSizeListener.asObservable();
    }

    static get windowScreenListener() {
        return this._windowSizeListener.pipe(map(x => {
            if (x.width < this._breakpoint_tablet_l) {
                return ScreenSize.small;
            } else if (x.width < this._breakpoint_laptop) {
                return ScreenSize.intermediary;
            }
            return ScreenSize.normal;
        }), distinctUntilChanged());
    }

    constructor() {
        window.onresize = (() => {
            WidthHeightListenerService._windowSizeListener.next(WidthHeightListenerService._getWindowWidthHeight());
        });
    }
}
