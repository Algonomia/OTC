import { PipeTransform, ArgumentMetadata, BadRequestException, LoggerService } from '@nestjs/common';
import { AppInjector } from '../../app.injector';
import { APP_LOGGER } from '../monitoring/logger/logger.factory';

export class FormDataIntFieldsPipe implements PipeTransform {
    constructor(private readonly fields: string[]) {}

    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body' || !value) return value;

        for (const field of this.fields) {
            if (field in value && value[field] !== undefined && value[field] !== null) {
                const parsed = Number(value[field]);
                if (!isNaN(parsed)) {
                    value[field] = parsed;
                }
            }
        }

        return value;
    }
}
