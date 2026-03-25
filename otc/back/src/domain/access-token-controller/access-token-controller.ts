import { Controller, Get, Post, Body, Res, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalOnlyGuard } from '../../GUARDS/internal-only.guard';
import { AuthGuard } from '../../GUARDS/auth.guard';
import { ProfileCompletionGuard } from '../../GUARDS/profile-completion.guard';
import { AccessTokenService } from '../../auth/token-auditor/access-token.service';
import { Response } from 'express';
import { CurrentUser } from '../../auth/decorators';
import { LoggedHttpException } from '../../utils/monitoring/errors/logged-http.exception';

@ApiExcludeController()
@UseGuards(InternalOnlyGuard)
@Controller('access_token')
export class AccessTokenController {
    constructor(
        private readonly _accessTokenService: AccessTokenService,
    ) {}

    @Get('all')
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getAll(@CurrentUser('user_id') user_id: string, @Res() res: Response) {
        try {
            const access_token = await this._accessTokenService.getAccessToken(user_id);
            return res.status(HttpStatus.OK).json(access_token);
        } catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, false);
        }
    }

    @Post('create')
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async createAccessToken(
        @Body() body: { expires_at_ms: number },
        @CurrentUser('user_id') user_id: string,
        @Res() res: Response,
    ) {
        try {
            const date = new Date(body.expires_at_ms);
            const [access_token] = await this._accessTokenService.createAccessToken(date, user_id);
            return res.status(HttpStatus.OK).json(access_token);
        } catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, false);
        }
    }

    @Post('delete')
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async deleteTokens(
        @Body() body: { keys: string[] },
        @CurrentUser('user_id') user_id: string,
        @Res() res: Response,
    ) {
        try {
            const deletedKeys = await this._accessTokenService.deleteAccessTokens(body.keys, user_id);
            return res.status(HttpStatus.OK).json(deletedKeys);
        } catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, []);
        }
    }
}
