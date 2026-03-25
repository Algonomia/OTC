import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import axios from 'axios';

interface IVirusTotalData {
    id: string;
    type: string;
    links: {
        self: string;
        item?: string;
    };
}

export interface IVirusTotalStat {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    timeout: number;
}

interface IVirusAttribute {
    date: string;
    status: string;
    results: unknown;
    stats: IVirusTotalStat;
}

interface IVirusTotalAnalysisData extends IVirusTotalData {
    attributes: IVirusAttribute;
}

type VirusTotalScanId = string;

@Injectable()
export class VirusTotalApiService {
    private readonly _apiKey: string;
    private readonly _rateLimitApi: number;
    private readonly _virusTotalApiUrl: string;
    private readonly _scanUrlApiUrl: string;
    private readonly _getUrlAnalysisApiUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._apiKey = this._configService.get<string>('VIRUS_TOTAL_API_KEY') || '';
        this._rateLimitApi = this._configService.get<number>('VIRUS_TOTAL_API_RATE_LIMIT') || 4;
        this._virusTotalApiUrl = 'https://www.virustotal.com/api/v3';
        this._scanUrlApiUrl = `${this._virusTotalApiUrl}/urls`;
        this._getUrlAnalysisApiUrl = `${this._virusTotalApiUrl}/analyses`;
    }

    get rateLimitApi(): number {
        return this._rateLimitApi;
    }

    async initiateUrlScan(url: string): Promise<VirusTotalScanId> {
        try {
            const response = await axios.post<{ data: IVirusTotalData }>(this._scanUrlApiUrl, `url=${url}`, {
                headers: { 'x-apikey': this._apiKey }
            });
            if (!response.data.data) {
                throw new Error('Invalid response from VirusTotal API');
            }
            return response.data.data.id;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `VirusTotal API error: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`VirusTotal API is not reachable: ${error.message}`);
        }
    }

    async getUrlAnalysis(analyseId: string): Promise<{status: string, rejected: boolean}> {
        try {
            const response = await axios.get<{ data: IVirusTotalAnalysisData }>(`${this._getUrlAnalysisApiUrl}/${analyseId}`, {
                headers: { 'x-apikey': this._apiKey }
            });
            if (!response.data.data) {
                throw new Error('Invalid response from VirusTotal API');
            }
            const status = response.data.data.attributes.status;
            const stats = response.data.data.attributes.stats;
            const rejected = stats.malicious > 0 || stats.suspicious > 0
            return {status, rejected};
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `VirusTotal API error: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw new Error(`VirusTotal API is not reachable: ${error.message}`);
        }
    }
}
