import {HttpClient, HttpErrorResponse, HttpStatusCode} from "@angular/common/http";
import {firstValueFrom} from "rxjs";

export abstract class HttpUtilsService {
    static getFile = (httpClient: HttpClient, url: string, responseType: any = 'blob'): Promise<any> =>
        firstValueFrom(
            httpClient.get(HttpUtilsService.getUrl(url), {responseType})
        ).catch((e: HttpErrorResponse) => {
            if (e.status === HttpStatusCode.NotFound) {
                throw new Error(`404: URL can't be fetched: "${url}"`);
            }
            throw e;
        });

    private static getUrl(url: string): string {
        if (url.includes('://')) {
            return url;
        } else if (typeof document !== 'undefined' && document.getElementsByTagName('base')[0]?.href) {
            return this.concatUrls(document.getElementsByTagName('base')[0]?.href, url);
        } else {
            return url;
        }
    }

    static concatUrls(url1: string, url2: string): string {
        if (url1.at(-1) === '/') {
            url1 = url1.slice(0, url1.length - 1);
        }
        if (url2.at(0) === '/') {
            url2 = url2.slice(1);
        }
        return url1 + '/' + url2;
    }

    static blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read blob as Base64'));
            reader.readAsDataURL(blob);
        });
    }
}
