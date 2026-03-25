import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class WindowStrategyService {
    static openPopupWindowCentered(url: string, title: string, width: number, height: number): Window | null {
        const top = (screen.height - height) / 2;
        const left = (screen.width - width) / 2;

        return window.open(url, title, `width=${width},height=${height},left=${left},top=${top}`);
    }

    static closeWindow(win: Window | null): void {
        if (win && !win.closed) {
            win.close();
        }
    }
}