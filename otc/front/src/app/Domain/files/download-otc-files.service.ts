import { Injectable } from '@angular/core';
import {GlobalEnvironment} from '../../../environments/otc-env';
import {HttpClient} from '@angular/common/http';
import {IDownloader, IFileWithUUID} from '@algonomia/ts-shared';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadOtcFilesService implements IDownloader<IFileWithUUID> {
    private readonly _fileDownloadUrl = `${GlobalEnvironment.apiUrl}files/download`;

    constructor(private _httpClient: HttpClient) { }

    async download(file: IFileWithUUID) {
        try {
            const response = await firstValueFrom(this._httpClient.get(`${this._fileDownloadUrl}?fileId=${file.uuid}`, {
                responseType: 'blob',
                withCredentials: true
            }));
            await this._downloadBlob(response, file.name);
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    async downloadZip(files: IFileWithUUID[]) {
        try {
            const response = await firstValueFrom(this._httpClient.post(`${this._fileDownloadUrl}`, {uuids: files.map(x => x.uuid)}, {
                responseType: 'blob',
                withCredentials: true,
            }));
            await this._downloadBlob(response, 'otc.zip');
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    private _downloadBlob(response: Blob, name: string) {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name; // You can set a specific filename here
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
