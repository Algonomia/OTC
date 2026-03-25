import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenAuditorService } from './token-auditor/token-auditor.service';

export interface AuthUser {
    provider: string;
    email: string;
    access_key: string;
    user_id: string;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly _tokenAuditorService: TokenAuditorService
    ) {}

    async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
        const cookieToken = req.cookies?.['token'];
        const headerToken = req.headers['x-api-key'] as string | undefined;

        if (cookieToken) {
            req.user = await this._tokenAuditorService.verifyOAuthToken(cookieToken) ?? undefined;
        } else if (headerToken) {
            req.user = await this._tokenAuditorService.verifyApiKeyToken(headerToken) ?? undefined;
        }

        next();
    }
}
