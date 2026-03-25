import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import axios from 'axios';

interface IThreatMatch {
    threatType: string;
    platformType: string;
    threat: { url: string };
    cacheDuration: string;
    threatEntryType: string;
}

interface LookupResponse {
    matches?: IThreatMatch[];
}

@Injectable()
export class GoogleSafeBrowsingApiService {
    private readonly _apiKey: string;
    private readonly _safeBrowsingServiceUrl: string;
    private readonly _lookupApiUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._apiKey = this._configService.get<string>('GOOGLE_API_KEY') || '';
        this._safeBrowsingServiceUrl = 'https://safebrowsing.googleapis.com/v4';
        this._lookupApiUrl = `${this._safeBrowsingServiceUrl}/threatMatches:find`;
    }

    async getUnsafeUrls(urls: string[]): Promise<string[]> {
        try {
            const response = await axios.post<LookupResponse>(this._lookupApiUrl, {
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM', 'IOS', 'ANDROID'],
                    threatEntryTypes: ['URL'],
                    threatEntries: urls.map(url => ({ url })),
                },
            }, { params: { key: this._apiKey }});
            const responseData = response.data;
            if (responseData.matches && responseData.matches.length > 0) {
                return responseData.matches.map(match => match.threat.url);
            }
            return [];
        } catch (error) {
            if (error instanceof HttpException) {
                throw new HttpException(`Safe Browsing error: ${error.message}`, error.getStatus());
            }
            throw new Error(`Safe Browsing service is not reachable: ${error.message}`);
        }
    }
}
