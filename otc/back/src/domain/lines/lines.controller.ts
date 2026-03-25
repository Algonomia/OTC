import { Body, Controller, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { GetValuesService } from '../values/database/get-values/get-values.service';
import { AuthGuard } from '../../GUARDS/auth.guard';
import { ProfileCompletionGuard } from '../../GUARDS/profile-completion.guard';
import { TOTCDatum, TPartialFilterValueHTTP, ZFilterValues, ZOTCDatum } from '@otc/domain';
import { ZodValidationPipe } from '../../utils/validation/zod-validation.pipe';
import { LoggedHttpException } from '../../utils/monitoring/errors/logged-http.exception';
import {Response} from 'express';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PostWithDoc, Schema } from '../../swagger/decorators';

@ApiTags('Lines')
@ApiSecurity('x-api-key')
@Controller('lines')
export class LinesController {
    constructor(private _getValuesService: GetValuesService) {}

    @PostWithDoc('', {
        summary: 'Get obligation lines with optional filters',
        response: { status: HttpStatus.OK, type: Schema('OTCDatum', ZOTCDatum), isArray: true, description: 'List of OTC datum lines' },
        body: { type: Schema('FilterValues', ZFilterValues) }
    })
    @UseGuards(AuthGuard, ProfileCompletionGuard)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async get(@Body(new ZodValidationPipe(ZFilterValues)) params: TPartialFilterValueHTTP, @Res() res: Response): Promise<Response<TOTCDatum[]>> {
        try {
            const valueLines = await this._getValuesService.getLines(params);
            return res.status(HttpStatus.OK).json(valueLines);
        } catch (e) {
            throw new LoggedHttpException(e, HttpStatus.INTERNAL_SERVER_ERROR, []);
        }
    }
}
