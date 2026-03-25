import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import axios from 'axios';
import * as FormData from 'form-data';
import { z, ZodType } from 'zod';

interface IOcrHealth {
    status: string;
}

interface IOcrIdentifier {
    id: number;
}

interface IOcrFileContent extends IOcrIdentifier {
    text: string;
}

interface IOcrFile extends IOcrFileContent {
    filename: string;
    created_at: number;
}

const IOcrFileIdentifierSchema = z.object({
    id: z.number()
});

const IOcrFileContentSchema = IOcrFileIdentifierSchema.extend({
    text: z.string()
});

const IOcrFileSchema: ZodType<IOcrFile> = IOcrFileContentSchema.extend({
    filename: z.string(),
    created_at: z.number()
});

@Injectable()
export class OcrApiService {
    private readonly _ocrServiceUrl: string;
    private readonly _ocrHealthUrl: string;
    private readonly _ocrUploadUrl: string;
    private readonly _ocrUploadFilesUrl: string;
    private readonly _ocrGetFileUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._ocrServiceUrl = this._configService.get<string>('OCR_SERVICE_URL') || 'http://localhost:8010';
        this._ocrHealthUrl = `${ this._ocrServiceUrl }/healthz`;
        this._ocrUploadUrl = `${ this._ocrServiceUrl }/extract/upload`;
        this._ocrUploadFilesUrl = `${ this._ocrServiceUrl }/extract/urls`;
        this._ocrGetFileUrl = `${ this._ocrServiceUrl }/files`;
    }

    get getFileUrl(): string {
        return this._ocrGetFileUrl;
    }

    getFileUrls(fileIds: number[]): string[] {
        return fileIds.map(id => `${this._ocrGetFileUrl}/${id}`);
    }

    async healthCheck(): Promise<IOcrHealth> {
        try {
            const response = await axios.get(this._ocrHealthUrl);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `OCR service is not reachable: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`OCR service is not reachable: ${error.message}`);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<IOcrFileContent> {
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, { filename: file.originalname });
    
            const response = await axios.post(this._ocrUploadUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            return IOcrFileContentSchema.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `Failed to upload file: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async uploadFilesFromUrls(urls: string[]): Promise<IOcrIdentifier[]> {
        try {
            const response = await axios.post<IOcrIdentifier[]>(this._ocrUploadFilesUrl, { urls: urls });
            return response.data.map((item: IOcrIdentifier) => IOcrFileIdentifierSchema.parse(item));
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `Failed to upload files from URLs: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`Failed to upload files from URLs: ${error.message}`);
        }
    }

    async getFile(fileId: string): Promise<IOcrFile> {
        try {
            const response = await axios.get(`${this._ocrGetFileUrl}/${fileId}`);
            return IOcrFileSchema.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `Failed to retrieve file: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`Failed to retrieve file: ${error.message}`);
        }
    }
}