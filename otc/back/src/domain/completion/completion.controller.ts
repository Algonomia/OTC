import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import {Response} from 'express';
import {GetValuesService} from '../values/database/get-values/get-values.service';
import {
    OtcFullLineCompletion,
    OTCSegmentLinesByCountry,
    ICountryBadge
} from '@otc/domain';
import {CustomCache} from '../../utils/cache/custom-cache.decorator';
import {TimeUnit} from '@algonomia/ts-shared';
import { LoggedHttpException } from '../../utils/monitoring/errors/logged-http.exception';
import { ApiExcludeController } from '@nestjs/swagger';

// Completion requests are public so no AUTHGUARDS + 10 minutes TTL CACHE to reduce abusive database hits

@ApiExcludeController()
@Controller('completion')
export class CompletionController {

    constructor(
        private _getValuesService: GetValuesService
    ) {}

    @Get('countries')
    async getCountryBadges(@Res() res: Response): Promise<Response<ICountryBadge[]>> {
        try {
            const badges = await this._getCountryBadges();
            return res.status(HttpStatus.OK).json(badges);
        }  catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, []);
        }
    }

    @CustomCache({
        baseKey: 'CompletionController:CountryBadges',
        ttl: 10,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: () => ''
    })
    private async _getCountryBadges() {
        const lines = await this._getValuesService.getLines({});
        const valuesPerIso2 = OTCSegmentLinesByCountry.toCountrySegmentation(lines);
        return OtcFullLineCompletion.getCountryBadges(valuesPerIso2);
    }

    @Get('overall')
    async getOverallCompletion(@Res() res: Response): Promise<Response<number>> {
        try {
            const completion = await this._getOverallCompletion();
            return res.status(HttpStatus.OK).json(completion);
        }  catch (error) {
            throw new LoggedHttpException(error, HttpStatus.BAD_REQUEST, 0);
        }
    }

    @CustomCache({
        baseKey: 'CompletionController:OverallCompletion',
        ttl: 10,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: () => ''
    })
    private async _getOverallCompletion() {
        const lines = await this._getValuesService.getLines({});
        return OtcFullLineCompletion.getOverallCompletion(lines);
    }
}
