import { Inject, Injectable } from '@nestjs/common';
import { KnexDatabaseProvider } from '../../utils/database/knex';
import {
    IBackApiAccessPublicInfo,
    IBackApiAccessPublicInfoAndSecret,
    TUser,
} from '@otc/domain';
import { JwtService } from '@nestjs/jwt';
import { v7 as UUID7 } from 'uuid';
import { CustomCache } from '../../utils/cache/custom-cache.decorator';
import { TimeUnit } from '@algonomia/ts-shared';
import { EAuthProvider, TokenData, TokenRepository } from './token-auditor.service';

export interface ApiAccessToken {
    access_key: string;
    access_token: string;
    user_id: string;
    expires_at: string;
    created_at: string;
}

@Injectable()
export class AccessTokenService implements TokenRepository {
    constructor(
        @Inject('API_JWT_SERVICE') private readonly _jwtService: JwtService,
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
    ) {}

    private _getAccessToken = `SELECT * FROM get_access_tokens(
        puser_id => ?
    )`;

    async getAccessToken(user_id: string): Promise<IBackApiAccessPublicInfo[]> {
        const query = await this._knexDatabaseProvider.knex.raw(this._getAccessToken, [
            user_id ?? ''
        ]);
        return query.rows;
    }

    public createAccessToken(expires_at: Date, user_id: string ): Promise<IBackApiAccessPublicInfoAndSecret[]> {
        const date = new Date(expires_at);
        const accessKey = UUID7();
        const accessToken = this._jwtService.sign({
            user_id: user_id,
            provider: EAuthProvider.api,
            access_key: accessKey
        }, { expiresIn: date.getTime() })

        return this._knexDatabaseProvider
            .knex('otc_access_token')
            .insert({
                user_id: user_id,
                expires_at: expires_at,
                created_at: new Date(),
                access_key: accessKey,
                access_token: accessToken,
            })
            .returning('*');
    }

    public async deleteAccessTokens(keys: string[], user_id : string): Promise<string[]> {
        if (!keys.length) return [];
        const deletedTokens = (await this._knexDatabaseProvider
            .knex('otc_access_token')
            .whereIn('access_key', keys)
            .andWhere('user_id', user_id)
            .del()
            .returning('access_key')) as Array<{ access_key: string }>;
        return deletedTokens.map((token) => token.access_key);
    }

    @CustomCache({
        baseKey: 'AccessTokenService:findByAccessTokenWithUser',
        ttl: 1,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: (accessToken: string) => accessToken
    })
    public findByAccessTokenWithUser(accessToken: string): Promise<ApiAccessToken & TUser | undefined> {
        return this._knexDatabaseProvider
            .knex<ApiAccessToken>('otc_access_token')
            .innerJoin('auth_user', 'otc_access_token.user_id', 'auth_user.id')
            .where('access_token', accessToken)
            .first();
    }

    @CustomCache({
        baseKey: 'AccessTokenService:getToken',
        ttl: 1,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: (accessToken: string) => accessToken
    })
    public getToken(accessToken: string): Promise<TokenData | undefined> {
        return this._knexDatabaseProvider
            .knex<ApiAccessToken>('otc_access_token')
            .select(
                this._knexDatabaseProvider.knex.raw("'api' as provider"),
                'otc_access_token.access_key',
                'otc_access_token.user_id',
                'otc_access_token.expires_at',
                'auth_user.email'
            )
            .innerJoin('auth_user', 'otc_access_token.user_id', 'auth_user.id')
            .where('access_token', accessToken)
            .first();
    }
}
