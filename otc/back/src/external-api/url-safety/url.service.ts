import { Injectable } from "@nestjs/common";
import * as dns from 'dns';
import axios from 'axios';

@Injectable()
export class UrlService {
    static async isDnsValid(uri: string): Promise<boolean> {
        try {
            await this.resolveUrlDns(uri);
            return true;
        } catch (error) {
            return false;
        }
    }

    static async resolveUrlDns(uri: string): Promise<string[]> {
        const url = new URL(uri);
        const domain = url.hostname;
        try {
            const addresses = await dns.promises.resolve(domain);
            return addresses;
        } catch (error) {
            throw new Error(`Failed to resolve domain ${domain}: ${error.message}`);
        }
    }

    static async isFileDirectLink(url: string): Promise<boolean> {
        try {
            const response = await axios.head(url);
            const contentType = response.headers['content-type'];
    
            if (contentType.startsWith('text/')) {
                return false;
            }
            return true;
        } catch (error) {
            throw new Error(`Failed to fetch URL headers: ${error.message}`);
        }
    }
}