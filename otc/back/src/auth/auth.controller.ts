import { Body, Controller, Get, HttpStatus, Inject, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalOnlyGuard } from '../GUARDS/internal-only.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../GUARDS/auth.guard';
import {
    TUser,
    ZPartialUserManualUpdateSchema,
    ZUserSchema,
    userUpdateFullValidatorGroup
} from '@otc/domain';
import {TPartialUserManualUpdate} from '@otc/domain';
import {LinkedinAuthProvider} from './linkedin/linkedin.provider';
import {DBUpdateUser} from './database/update';
import {DBCreateUser} from './database/create';
import {AlgoValidatorsPipe} from '../utils/validation/algo-validators.pipe';
import {ZodValidationPipe} from '../utils/validation/zod-validation.pipe';
import { OauthTokenRepository } from './token-auditor/oauth-token.repository';
import { CurrentUser } from './decorators';
import { EAuthProvider } from './token-auditor/token-auditor.service';
import { LoggedHttpException } from 'src/utils/monitoring/errors/logged-http.exception';


@ApiExcludeController()
@UseGuards(InternalOnlyGuard)
@Controller('auth')
export class AuthController {
    private readonly _secondToMs = 1000;

    constructor(
        private readonly _linkedin: LinkedinAuthProvider,
        @Inject('AUTH_JWT_SERVICE') private readonly _jwtService: JwtService,
        private readonly _configService: ConfigService,
        private readonly _dbCreateUser: DBCreateUser,
        private readonly _dbUpdateUser: DBUpdateUser,
        private readonly _oauthTokenRepository: OauthTokenRepository
    ) { }

    @Get('linkedin/callback')
    async getAccessToken(@Query('code') code: string, @Res() res: Response) {
        const token = await this._linkedin.getAccessToken(code);
        const userInfo = await this._linkedin.getUserInfo(token.access_token);
        const profile = await this._dbCreateUser.getOrCreate(userInfo);
        const expiresAt = new Date(Date.now() + token.expires_in * this._secondToMs);
        const oauthAccessToken = await this._oauthTokenRepository.create(profile.id, EAuthProvider.linkedin, token.access_token, expiresAt);

        res.cookie('token', this._jwtService.sign({
            provider: oauthAccessToken.provider,
            access_key: oauthAccessToken.access_key,
            user_id: profile.id
        }, { expiresIn: token.expires_in }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: token.expires_in * this._secondToMs,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });

        const redirectUrl = this._configService.get<string>('CORS_ORIGIN') || 'http://localhost:4200';
        res.redirect(redirectUrl);
    }

    @Get('status')
    async getAuthStatus(@Req() req: Request, @Res() res: Response) {
        // AuthMiddleware already checked cookie and populated req.user
        // If req.user exists, user is authenticated
        return res.status(HttpStatus.OK).json({
            authenticated: !!(req as any).user
        });
    }

    @Post('logout')
    async logout(@Res() res: Response) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        return res.status(HttpStatus.OK).json({ success: true });
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@CurrentUser('access_key') accessKey: string, @Res() res: Response) {
        const oauthToken = await this._oauthTokenRepository.findByAccessKey(accessKey);
        if (!oauthToken) {
            throw UnauthorizedException;
        }
        const linkedinUser = await this._linkedin.getUserInfo(oauthToken.access_token);
        const profile = await this._dbCreateUser.getOrCreate(linkedinUser);

        return res.json(profile);
    }

    @UseGuards(AuthGuard)
    @Post('profile')
    async postProfile(
        @Body(
            new ZodValidationPipe(ZPartialUserManualUpdateSchema),
            new AlgoValidatorsPipe(userUpdateFullValidatorGroup),
        ) body: TPartialUserManualUpdate,
        @CurrentUser('user_id') id: string,
        @Res() res: Response
    ) {
        try {
            const user: TUser[] = await this._dbUpdateUser.updateUser({
                ...body,
                id: id
            })
            res.json(ZUserSchema.parse(user[0]));
        } catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, {
                message: 'Something went wrong'
            });
        }
    }

    @UseGuards(AuthGuard)
    @Post('acceptCGU')
    async acceptCGU(@CurrentUser('user_id') id: string, @Res() res: Response) {
        try {
            const user: TUser[] = await this._dbUpdateUser.updateCGU(id);
            res.json(ZUserSchema.parse(user[0]));
        } catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, {
                message: 'Something went wrong'
            });
        }
    }
}
