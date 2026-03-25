import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
    LoggerService,
} from '@nestjs/common';
import {Request, Response} from 'express';
import { APP_LOGGER } from '../logger/logger.factory';
import {LoggedHttpException} from './logged-http.exception';

export interface RequestContext {
    requestId: string;
    userId: string;
    provider: string;
    startTime: number;
}

export interface loggerDataRequest extends Request {
    loggerData: RequestContext;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(@Inject(APP_LOGGER) private readonly logger: LoggerService) {}

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<loggerDataRequest>();

        const { method, originalUrl } = request;
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.message : 'Internal server error';
        const context = this._getContext(exception);

        this.logger.error(
            `[${context}] Error: ${method} ${originalUrl}`,
            {
                context,
                method,
                url: originalUrl,
                status_code: status,
                error_message: message,
                error_stack: exception.stack,
                user_id: request.loggerData?.userId ?? 'unknown',
                provider: request.loggerData?.provider ?? 'none',
                request_id: request.loggerData?.requestId ?? 'unknown'
            }
        );

        if (exception instanceof LoggedHttpException && exception.responseBody !== null) {
            return response.status(status).json(exception.responseBody);
        }

        response.status(status).json({
            statusCode: status,
            message: message
        });
    }

    private _getContext(exception: Error): string {
        // Use explicit context if provided
        if (exception instanceof LoggedHttpException && exception.context) {
            return exception.context;
        }

        // Try to extract from stack trace (first non-node_modules frame)
        const stack = exception.stack ?? '';
        const match = stack.match(/at (\w+)\.([\w<>]+)/);
        if (match) {
            return `${match[1]}.${match[2]}`;
        }

        return 'Unknown';
    }
}
