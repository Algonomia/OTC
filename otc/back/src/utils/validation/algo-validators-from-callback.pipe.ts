import { PipeTransform, ArgumentMetadata, BadRequestException, LoggerService } from '@nestjs/common';
import { AppInjector } from '../../app.injector';
import { APP_LOGGER } from '../monitoring/logger/logger.factory';

export class AlgoValidatorsFromCallbackPipe<T> implements PipeTransform {
    constructor(
        private _getValidator: (value: T) => {checkErrors: (x: T) => any},
    ) {}

    transform(values: T[], metadata: ArgumentMetadata): T[] {
        try {
            for (const value of values) {
                const validator = this._getValidator(value);
                const errors = validator.checkErrors(value);
                if (errors.length) {
                    this.logger.error('Validation failed', { errors });
                    throw new BadRequestException({
                        message: 'Validation failed',
                        errors: errors
                    });
                }
            }
            return values;
        } catch (e) {
            this.logger.error('Validation failed', { error: e?.message });
            throw new BadRequestException('Validation failed');
        }
    }

    private _logger: LoggerService;
    private get logger(): LoggerService {
        return (this._logger ??= AppInjector.get<LoggerService>(APP_LOGGER));
    }
}
