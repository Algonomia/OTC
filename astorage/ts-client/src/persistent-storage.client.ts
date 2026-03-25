import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { IFileMeta } from '@algonomia/ts-shared';
import { PersistentStorageMicroserviceError, PersistentStorageNetworkError } from './errors';

export interface IUploadFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

export interface IPersistentStorageLogger {
    error(message: string, ...args: unknown[]): void;
}

export interface IDownloadResult {
    data: Readable;
    headers: Record<string, string>;
}

export class PersistentStorageClient {
    private readonly _uploadUrl: string;
    private readonly _downloadUrl: string;
    private readonly _presignUrl: string;
    private readonly _metadataUrl: string;
    private readonly _pingUrl: string;

    constructor(
        readonly _serviceUrl: string,
        private readonly _logger?: IPersistentStorageLogger,
    ) {
        this._uploadUrl = `${_serviceUrl}/upload`;
        this._downloadUrl = `${_serviceUrl}/download`;
        this._presignUrl = `${_serviceUrl}/presign`;
        this._metadataUrl = `${_serviceUrl}/metadata`;
        this._pingUrl = `${_serviceUrl}/ping`;
    }

    async ping(): Promise<unknown> {
        try {
            const response = await axios.get(this._pingUrl);
            return response.data;
        } catch {
            throw new Error('File service is not reachable');
        }
    }

    async getFileMetadata(uuids: string[]): Promise<IFileMeta[]> {
        try {
            const response = await axios.post<IFileMeta[]>(this._metadataUrl, { ids: uuids });
            return response.data;
        } catch (error) {
            this._logger?.error('File service is not reachable', { context: 'PersistentStorageClient', method: 'getFileMetadata' });
            return [];
        }
    }

    async uploadFiles(files: IUploadFile[], additionalData: unknown[] = []): Promise<IFileMeta[]> {
        if (!files?.length) {
            return [];
        }
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }
        formData.append('additionalData', JSON.stringify(additionalData));
        return this._uploadFormData(formData);
    }

    async uploadFileContent(
        content: Buffer,
        filename: string,
        contentType: string,
        additionalData: unknown = undefined,
    ): Promise<IFileMeta[]> {
        const formData = new FormData();
        formData.append('files', content, { filename, contentType });
        formData.append('additionalData', JSON.stringify(Array(additionalData) || []));
        return this._uploadFormData(formData);
    }

    async getPresignedUrls(uuids: string[]): Promise<{ urls: string[] }> {
        try {
            const response = await axios.post<{ urls: string[] }>(this._presignUrl, { uuids });
            return response.data;
        } catch (error) {
            this._logger?.error(`Error getting presigned URLs: ${(error as Error).message}`);
            this._handleError(error, this._presignUrl);
        }
    }

    async downloadFile(uuid: string): Promise<IDownloadResult> {
        try {
            const response = await axios.get<Readable>(this._downloadUrl, {
                params: { uuid },
                responseType: 'stream',
            });
            return { data: response.data, headers: response.headers as Record<string, string> };
        } catch (error) {
            this._logger?.error(`Error downloading file: ${(error as Error).message}`);
            this._handleError(error, this._downloadUrl);
        }
    }

    async downloadZipFile(uuids: string[]): Promise<IDownloadResult> {
        try {
            const response = await axios.post<Readable>(this._downloadUrl, { uuids }, { responseType: 'stream' });
            return { data: response.data, headers: response.headers as Record<string, string> };
        } catch (error) {
            this._logger?.error(`Error downloading files: ${(error as Error).message}`);
            this._handleError(error, this._downloadUrl);
        }
    }

    private async _uploadFormData(formData: FormData): Promise<IFileMeta[]> {
        try {
            const { data } = await axios.post<IFileMeta[]>(this._uploadUrl, formData, {
                headers: { ...formData.getHeaders() },
            });
            return data;
        } catch (error) {
            this._handleError(error, this._uploadUrl);
        }
    }

    private _handleError(error: unknown, serviceUrl: string): never {
        if (axios.isAxiosError(error) && error.response) {
            throw new PersistentStorageMicroserviceError(
                'File microservice error',
                error.response.status,
                error.response.data,
                serviceUrl,
            );
        }
        throw new PersistentStorageNetworkError('File microservice is unavailable', serviceUrl);
    }
}
