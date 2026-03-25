import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { KnexDatabaseProvider } from "../../utils/database/knex";
import { CustomCache } from "../../utils/cache/custom-cache.decorator";
import { TimeUnit } from "@algonomia/ts-shared";
import { v7 as uuid7 } from 'uuid';
import { TokenData, TokenRepository } from './token-auditor.service'

export interface OauthAccessToken {
    access_key: string;
    access_token: string;
    user_id: string;
    provider: string;
    expires_at: string;
    created_at: string;
}

@Injectable()
export class OauthTokenRepository implements TokenRepository {
    constructor(private readonly _database: KnexDatabaseProvider) {}

    @CustomCache({
        baseKey: 'OauthTokenRepository:getToken',
        ttl: 1,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: (accessKey: string) => accessKey
    })
    getToken(accessKey: string): Promise<TokenData | undefined> {
        return this._database.knex<OauthAccessToken>('oauth_access_token')
            .select('provider', 'access_key', 'user_id', 'expires_at', 'email')
            .innerJoin('auth_user', 'oauth_access_token.user_id', 'auth_user.id')
            .where('access_key', accessKey)
            .first();
    }

    findByAccessKey(accessKey: string): Promise<OauthAccessToken | undefined> {
        return this._database.knex<OauthAccessToken>('oauth_access_token')
            .where('access_key', accessKey)
            .first();
    }

    async create(userId: string, provider: string, accessToken: string, expiresAt: Date): Promise<OauthAccessToken> {
        const [oauthAccessToken] = await this._database.knex('oauth_access_token')
            .insert({
                user_id: userId,
                access_key: uuid7(),
                access_token: accessToken,
                expires_at: expiresAt,
                provider: provider
            })
            .returning('*');

        return oauthAccessToken;
    }

    deleteByAccessKey(accessKey: string): Promise<number> {
        return this._database.knex<OauthAccessToken>('oauth_access_token')
            .where('access_key', accessKey)
            .delete();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpired(): Promise<number> {
        const deletedCount = await this._database.knex<OauthAccessToken>('oauth_access_token')
            .where('expires_at', '<', new Date())
            .delete();
        return deletedCount;
    }
}
