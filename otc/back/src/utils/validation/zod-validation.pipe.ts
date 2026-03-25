import { PipeTransform, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { ZodError } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
    private readonly logger = new Logger(ZodValidationPipe.name);

    constructor(
        private _schema: {parse: (x: T) => any}, // TODO : Should be zodType but have the following bug : Type instantiation is excessively deep and possibly infinite.
    ) {}

    transform(value: T, metadata: ArgumentMetadata): T {
        try {
            return this._schema.parse(value);
        } catch (error) {
            if (error instanceof ZodError) {
                this.logger.error('Zod validation failed', { errors: error.issues });
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.issues
                });
            }
            this.logger.error('Validation failed', { error: error?.message });
            throw new BadRequestException('Validation failed');
        }
    }
}
