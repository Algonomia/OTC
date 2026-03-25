import { HttpException, HttpStatus } from '@nestjs/common';

export class LoggedHttpException extends HttpException {
    constructor(
        public readonly originalError: Error | string,
        status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        public readonly responseBody: any = null,
        public readonly context?: string
    ) {
        const message = originalError instanceof Error ? originalError.message : originalError;
        super(message, status);
    }
}
