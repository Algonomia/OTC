import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ILinkedInUser } from '@otc/domain';
import { TimeUnit } from '@algonomia/ts-shared';
import {AuthProvider} from '../auth.interface';
import {CustomCache} from '../../utils/cache/custom-cache.decorator';
import { APP_LOGGER } from '../../utils/monitoring/logger/logger.factory';

@Injectable()
export class LinkedinAuthProvider extends AuthProvider {
    private readonly _getAccessTokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    private readonly _getUserInfoUrl = 'https://api.linkedin.com/v2/userinfo';

    constructor(
        private readonly _httpService: HttpService,
        private readonly _configService: ConfigService,
        @Inject(APP_LOGGER) private readonly _logger: LoggerService
    ) {
        super();
    }

    async getAccessToken(code: string): Promise<any> {
        const { data } = await firstValueFrom(
            this._httpService.post(this._getAccessTokenUrl, null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this._configService.get<string>('LINKEDIN_REDIRECT_URI'),
                client_id: this._configService.get<string>('LINKEDIN_CLIENT_ID'),
                client_secret: this._configService.get<string>('LINKEDIN_CLIENT_SECRET'),
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).pipe(catchError(err => {
            this._logger.error(`Error fetching access token: ${JSON.stringify(err.response?.data)}`);
            throw new Error('Failed to fetch access token');
        })));
        return data;
    }

    // cache enables to not hit linkedin api very often, thus limiting rate
    @CustomCache({
        baseKey: 'LinkedinAuthProvider:getUserInfo',
        ttl: 1,
        ttlUnit: TimeUnit.hours,
        keyBuilder: ((accessToken: string) => accessToken)
    }) async getUserInfo(accessToken: string): Promise<ILinkedInUser> {
        const { data } = await firstValueFrom(
            this._httpService.get(this._getUserInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).pipe(
                catchError(err => {
                    this._logger.error(`Error fetching user profile: ${JSON.stringify(err.response?.data)}`);
                    throw new Error('Failed to fetch user profile');
                })
            )
        );

        return {
            firstname: data.given_name,
            lastname: data.family_name,
            email: data.email,
            email_verified: data.email_verified ?? false,
            picture: data.picture ?? '',
            country: data.locale.country,
            language: data.locale.language
        };
    }
}
