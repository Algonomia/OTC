import {Body, Controller, Get, HttpStatus, Post, Res, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../../GUARDS/auth.guard';
import {ProfileCompletionGuard} from '../../GUARDS/profile-completion.guard';
import {Response} from 'express';
import {
    CreateOtcFullContributionView,
    CreateOtcFullHistoryView,
    TDatumFullContributionView,
    TDatumFullHistoryView,
    get_value_validator,
    TFullSubmitRate,
    TOTCCreateDatum,
    IOTCDatumId,
    TOTCHistorySegment,
    IOTCRate,
    submitRateValidator,
    EValuesStatus,
    ZDatumFullContributionView,
    ZOTCRate,
    ZDatumFullHistoryView,
    ZFullSubmitRateSchema,
    ZOTCCreateDatum,
    ZOTCDatumId,
    ZOTCValueHistorySegment
} from '@otc/domain';
import {GetValuesService} from './database/get-values/get-values.service';
import {Knex} from 'knex';
import {KnexDatabaseProvider} from '../../utils/database/knex';
import {ZodValidationPipe} from '../../utils/validation/zod-validation.pipe';
import {AlgoValidatorsFromCallbackPipe} from '../../utils/validation/algo-validators-from-callback.pipe';
import {AlgoValidatorsPipe} from '../../utils/validation/algo-validators.pipe';
import {GetSourcesService} from '../sources/database/get-sources/get-sources.service';
import {IsAdminGuard} from '../../GUARDS/is-admin.guard';
import {InternalOnlyGuard} from '../../GUARDS/internal-only.guard';
import {DBGetUser} from '../../auth/database/get';
import { CurrentUser } from '../../auth/decorators';
import { LoggedHttpException } from '../../utils/monitoring/errors/logged-http.exception';
import { ApiExcludeEndpoint, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetWithDoc, PostWithDoc, Schema } from '../../swagger/decorators';

@ApiTags('Values')
@ApiSecurity('x-api-key')
@Controller('values')
export class ValuesController {
    private readonly _database: Knex;

    constructor(
        private _getValuesService: GetValuesService,
        private _getSourcesService: GetSourcesService,
        private readonly _dbGetUser: DBGetUser,
        private readonly _knexDatabaseProvider: KnexDatabaseProvider
    ) {
        this._database = this._knexDatabaseProvider.knex;
    }

    @Get('is_values_manager')
    @UseGuards(InternalOnlyGuard, AuthGuard)
    @ApiExcludeEndpoint()
    async getIsValuesManager(
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<boolean>> {
        try {
            const isAdmin = await this._dbGetUser.getIsUserAdmin(email);
            return res.status(HttpStatus.OK).json(isAdmin);
        }  catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, false);
        }
    }

    @PostWithDoc('history', {
        summary: 'Get value history for a given segment',
        response: { status: HttpStatus.OK, type: Schema('TDatumFullHistoryView', ZDatumFullHistoryView), isArray: true, description: 'List of history views with source info' },
        body: { type: Schema('OTCValueHistorySegment', ZOTCValueHistorySegment) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getHistory(
        @Body(new ZodValidationPipe(ZOTCValueHistorySegment)) segment: TOTCHistorySegment,
        @CurrentUser('user_id') user_id: string,
        @Res() res: Response
    ): Promise<Response<TDatumFullHistoryView[]>> {
        try {
            const [historyViews, otcSourceMetas] = await Promise.all([
                this._getValuesService.getSegmentHistory(user_id, segment),
                this._getSourcesService.get()
            ]);
            const historyFullView = CreateOtcFullHistoryView.fuse(otcSourceMetas, historyViews);
            return res.status(HttpStatus.OK).json(historyFullView);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, []);
        }
    }

    @GetWithDoc('contributions', {
        summary: 'Get current user contributions',
        response: { status: HttpStatus.OK, type: Schema('TDatumFullContributionView', ZDatumFullContributionView), isArray: true, description: 'List of contribution views with source info' }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getContributions(
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<TDatumFullContributionView[]>> {
        try {
            const [contributionViews, otcSourceMetas] = await Promise.all([
                this._getValuesService.getContributions(email),
                this._getSourcesService.get()
            ]);
            const contributionsFullView = CreateOtcFullContributionView.fuse(otcSourceMetas, contributionViews);
            return res.status(HttpStatus.OK).json(contributionsFullView);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, []);
        }
    }

    @PostWithDoc('rates', {
        summary: 'Get all ratings for a specific datum',
        response: { status: HttpStatus.OK, type: Schema('OTCRate', ZOTCRate), isArray: true },
        body: { type: Schema('OTCDatumId', ZOTCDatumId) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getRates(
        @Body(new ZodValidationPipe(ZOTCDatumId)) segment: IOTCDatumId,
        @Res() res: Response
    ): Promise<Response<IOTCRate[]>> {
        try {
            const rates = await this._getValuesService.getRates(segment);
            return res.status(HttpStatus.OK).json(rates);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, []);
        }
    }

    @PostWithDoc('currentUserRate', {
        summary: 'Get current user rating for a specific datum',
        response: { status: HttpStatus.OK, type: Schema('OTCRate', ZOTCRate), isArray: true },
        body: { type: Schema('OTCDatumId', ZOTCDatumId) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async getUserRates(
        @Body(new ZodValidationPipe(ZOTCDatumId)) segment: IOTCDatumId,
        @CurrentUser('user_id') user_id: string,
        @Res() res: Response
    ): Promise<Response<IOTCRate[]>> {
        try {
            const userRates = await this._getValuesService.getUserRates(user_id, segment);
            return res.status(HttpStatus.OK).json(userRates);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, []);
        }
    }

    @PostWithDoc('submitRate', {
        summary: 'Submit a rating for a datum',
        response: { status: HttpStatus.OK, type: Boolean },
        body: { type: Schema('FullSubmitRate', ZFullSubmitRateSchema) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async submitRate(
        @Body(new ZodValidationPipe(ZFullSubmitRateSchema), new AlgoValidatorsPipe(submitRateValidator)) submitRate: TFullSubmitRate,
        @CurrentUser('user_id') user_id: string,
        @Res() res: Response<boolean>
    ): Promise<Response> {
        try {
            await this._getValuesService.submitRates(user_id, submitRate);
            return res.status(HttpStatus.OK).json(true);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, false);
        }
    }

    @PostWithDoc('suggestValue', {
        summary: 'Suggest new values for an obligation datum',
        response: { status: HttpStatus.OK, type: Number, isArray: true, description: 'Array of created record IDs' },
        body: { type: Schema('OTCCreateDatum', ZOTCCreateDatum), isArray: true }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    async createValues(
        @Body(
            new ZodValidationPipe(ZOTCCreateDatum.array()),
            new AlgoValidatorsFromCallbackPipe((x: TOTCCreateDatum) => get_value_validator(x.obligation_type_id, x.key))
        ) body: TOTCCreateDatum[],
        @CurrentUser('user_id') user_id: string,
        @CurrentUser('email') email: string,
        @Res() res: Response
    ): Promise<Response<number[]>> {
        const status = (await this._dbGetUser.isUserAdminOrTrusted(email)) ? EValuesStatus.Accepted : EValuesStatus.WaitingForAdminValidation;
        return res.status(HttpStatus.OK).json(await this._insertInBDD(body, user_id, status));
    }

    private _insertInBDD(datum: TOTCCreateDatum[], user_id: string, status: EValuesStatus) {
        const version = new Date().toLocaleDateString(undefined, {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        return this._database('otc_user_value').insert(
            datum.map(x => {
                return {...x, value: this._toKnexJson(x.value), status: status, user_id, version, additional_values: x.additional_values ? this._toKnexJson(x.additional_values) : null};
            })
        ).returning('*');
    }

    private _toKnexJson(x: any) {
        if (Array.isArray(x) || typeof x === 'string') {
            return JSON.stringify(x);
        }
        return x;
    }

    @Post('validate')
    @UseGuards(InternalOnlyGuard, AuthGuard, IsAdminGuard)
    @ApiExcludeEndpoint()
    validateValue(
        @Body() body: {id: number, comment: string},
        @Res() res: Response
    ): Promise<Response<boolean>> {
        return this._updateStatus(body, res, EValuesStatus.Accepted);
    }

    @Post('reject')
    @UseGuards(InternalOnlyGuard, AuthGuard, IsAdminGuard)
    @ApiExcludeEndpoint()
    rejectValue(
        @Body() body: {id: number, comment: string},
        @Res() res: Response
    ): Promise<Response<boolean>> {
        return this._updateStatus(body, res, EValuesStatus.Rejected);
    }

    private async _updateStatus(
        body: {id: number, comment: string},
        res: Response,
        status: EValuesStatus.Accepted | EValuesStatus.Rejected
    ): Promise<Response<boolean>> {
        if (!body?.id) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'No source provided',
            });
        }
        try {
            await this._database('otc_user_value')
                .where('status', '!=', status)
                .andWhere({ id: body.id })
                .update({status: status, admin_comment: body.comment ?? ''});

            return res.status(HttpStatus.OK).json(true);
        } catch(error) {
            throw new LoggedHttpException(error, HttpStatus.INTERNAL_SERVER_ERROR, false);
        }
    }
}
