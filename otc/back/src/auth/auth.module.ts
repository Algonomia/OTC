import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LinkedinAuthProvider } from './linkedin/linkedin.provider';
import { KnexDatabaseProvider } from '../utils/database/knex';
import { DBUpdateUser } from './database/update';
import { DBCreateUser } from './database/create';
import { DBGetUser } from './database/get';
import { OauthTokenRepository } from './token-auditor/oauth-token.repository';
import { AccessTokenService } from './token-auditor/access-token.service';
import { AuthMiddleware } from './auth.middleware';
import { TokenAuditorService } from './token-auditor/token-auditor.service';

@Module({
    imports: [HttpModule],
    controllers: [AuthController],
    providers: [
        LinkedinAuthProvider,
        DBGetUser,
        DBUpdateUser,
        DBCreateUser,
        KnexDatabaseProvider,
        OauthTokenRepository,
        AccessTokenService,
        AuthMiddleware,
        TokenAuditorService,
        {
            provide: 'AUTH_JWT_SERVICE',
            useFactory: () =>
                new JwtService({
                    secret: process.env.JWT_SECRET || 'default',
                }),
        },
        {
            provide: 'API_JWT_SERVICE',
            useFactory: () =>
                new JwtService({
                    secret: process.env.API_JWT_SERVICE || 'default',
                }),
        },
    ],
    exports: ['AUTH_JWT_SERVICE', 'API_JWT_SERVICE', OauthTokenRepository, AccessTokenService, AuthMiddleware, TokenAuditorService],
})
export class AuthModule {}