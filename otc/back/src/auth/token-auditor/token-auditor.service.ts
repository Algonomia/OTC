import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from '../auth.middleware';
import { AppInjector } from '../../app.injector';
import { OauthTokenRepository } from './oauth-token.repository';
import { AccessTokenService } from './access-token.service';

export const EAuthProvider = {
    api: 'api',
    linkedin: 'linkedin'
} as const

type EAuthProvider = typeof EAuthProvider[keyof typeof EAuthProvider];

export interface TokenData {
    provider: EAuthProvider;
    access_key: string;
    email: string;
    user_id: string;
    expires_at: string;
}

export interface TokenRepository {
    getToken(token: string): Promise<TokenData | undefined>;
}

@Injectable()
export class TokenAuditorService {
    constructor(
        @Inject('AUTH_JWT_SERVICE') private readonly _oauthJwtService: JwtService,
        @Inject('API_JWT_SERVICE') private readonly _apiJwtService: JwtService
    ) {}

    verifyOAuthToken(token: string): Promise<AuthUser | undefined> {
        try {
            const { access_key, provider } = this._oauthJwtService.verify(token);
            return this._verifyToken(access_key, provider);
        } catch {
            return Promise.resolve(undefined);
        }
    }

    verifyApiKeyToken(token: string): Promise<AuthUser | undefined> {
        try {
            this._apiJwtService.verify(token);
            return this._verifyToken(token, EAuthProvider.api);
        } catch {
            return Promise.resolve(undefined);
        }
    }

    async _verifyToken(token: string, provider: EAuthProvider): Promise<AuthUser | undefined> {
        const tokenData = await TokenAuditorService.providerGetTokenRepository[provider].getToken(token);

        if (!tokenData || this._isExpired(tokenData.expires_at)) {
            // TODO: Is it interesting to delete key in the database ?
            return undefined;
        }

        return {
            access_key: tokenData.access_key,
            provider: tokenData.provider,
            email: tokenData.email,
            user_id: tokenData.user_id
        };
    }

    private _isExpired(expiresAt: string): boolean {
        return new Date(expiresAt).getTime() < Date.now();
    }

    private static _providerGetTokenRepository: {[key in EAuthProvider]: TokenRepository} | null = null;

    private static get providerGetTokenRepository(): {[key in EAuthProvider]: TokenRepository} {
        if (!this._providerGetTokenRepository) {
            this._providerGetTokenRepository = {
                [EAuthProvider.api]: AppInjector.get(AccessTokenService),
                [EAuthProvider.linkedin]: AppInjector.get(OauthTokenRepository)
            };
        }
        return this._providerGetTokenRepository;
    }
}
