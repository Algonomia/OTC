import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import axios from 'axios';
import {z, ZodType} from 'zod';

enum ScrapMode {
    HTML = 'html',
    TEXT = 'text',
    RAW = 'raw'
}

interface IScrapResult {
    url: string;
    final_url: string;
    status: number;
    content_type: string;
    content_length: number;
    mode: string;
    content: string;
}

const IScrapResultSchema: ZodType<IScrapResult> = z.object({
    url: z.string().url(),
    final_url: z.string().url(),
    status: z.number().min(100).max(599),
    content_type: z.string(),
    content_length: z.number().min(0),
    mode: z.string(),
    content: z.string()
});

@Injectable()
export class ScraperApiService {
    private readonly _scraperServiceUrl: string;
    private readonly _scraperFetchUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._scraperServiceUrl = this._configService.get<string>('SCRAPER_SERVICE_URL') || 'http://localhost:8020';
        this._scraperFetchUrl = `${ this._scraperServiceUrl }/fetch`;
    }

    async getUrlContent(link: string, mode: ScrapMode = ScrapMode.RAW): Promise<IScrapResult> {
        try {
            const response = await axios.get(this._scraperFetchUrl, {
                params: { url: link, mode: mode }
            });
            return IScrapResultSchema.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `ScrapApiService: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`ScrapApiService: ${error.message}`);
        }
    }
}