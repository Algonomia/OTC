import { TestBed } from '@angular/core/testing';
import {WidthHeightListenerService, ScreenSize, WindowWidthHeight} from './width-height-listener.service';
import { take } from 'rxjs/operators';
import {firstValueFrom} from 'rxjs';

describe('WidthHeightListenerService', () => {
    let service: WidthHeightListenerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WidthHeightListenerService]
        });
        service = TestBed.inject(WidthHeightListenerService);
    });

    afterEach(() => {
        (window as any).onresize = null;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit ScreenSize.small when width < tablet breakpoint', async () => {
        resetWindowSizeSubject(800, 600);

        const screenSize = await firstValueFrom(
            WidthHeightListenerService.windowScreenListener
        );

        expect(screenSize).toBe(ScreenSize.small);
    });

    it('should emit ScreenSize.intermediary when width is between tablet and laptop breakpoints', async () => {
        resetWindowSizeSubject(1000, 700);

        const screenSize = await firstValueFrom(
            WidthHeightListenerService.windowScreenListener
        );

        expect(screenSize).toBe(ScreenSize.intermediary);
    });

    it('should emit ScreenSize.normal when width >= laptop breakpoint', async () => {
        resetWindowSizeSubject(1400, 900);

        const screenSize = await firstValueFrom(
            WidthHeightListenerService.windowScreenListener
        );

        expect(screenSize).toBe(ScreenSize.normal);
    });
});

function resetWindowSizeSubject(width: number, height: number) {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(width);
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(height);

    (WidthHeightListenerService as any)._windowSizeListener =
        new (require('rxjs').BehaviorSubject)({ width, height });
}
