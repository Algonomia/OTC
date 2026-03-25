import { Inject, Injectable, LoggerService, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../../../auth/auth.middleware';
import { ApiUsageBufferService } from '../audit/api-usage-buffer.service';
import { APP_LOGGER } from './logger.factory';

const MAX_BODY_LENGTH = parseInt(process.env.MAX_DEBUG_BODY_LENGTH || '10000', 10);
const SHOW_INPUTS  = process.env.SHOW_INPUTS === 'true';
const SHOW_OUTPUTS = process.env.SHOW_OUTPUTS === 'true';

function truncate(value: unknown): string {
    try {
        const json = JSON.stringify(value, null, 2);
        if (json.length <= MAX_BODY_LENGTH) return json;
        return json.slice(0, MAX_BODY_LENGTH) + `\n... [truncated, ${json.length} chars total]`;
    } catch {
        return '[unserializable]';
    }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

    constructor(
        @Inject(APP_LOGGER) private readonly logger: LoggerService,
        private readonly apiUsageBuffer: ApiUsageBufferService
    ) {}

    use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const startDate = new Date();
        req['loggerData'] = this._getRequestLoggerData(req);

        this._logStartMessage(req['loggerData'], req, startDate);

        if (SHOW_OUTPUTS) {
            this._captureResponseBody(req, res);
        }

        if (req.user) {
            this.apiUsageBuffer.addRequest(req.user.access_key, req.user.provider);
        }

        res.on('finish', () => {
            this._logEndMessage(req['loggerData'], req, res, startDate);
        });

        next();
    }

    private _captureResponseBody(req: Request, res: Response): void {
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            req['debugResponseBody'] = body;
            return originalJson(body);
        };
    }

    private _getRequestLoggerData(req: AuthenticatedRequest) {
        const userId = req.user?.user_id ?? 'anonymous';
        const provider = req.user?.provider ?? 'none';
        const requestId = uuidv4();
        return {userId, provider, requestId};
    }

    private _logStartMessage(loggerData: any, req: Request, startDate: Date) {
        const label = `${req.method} ${req.originalUrl}`;
        const startContext = {...loggerData, method: req.method, body: req.body, url: req.originalUrl, ip: req.ip, timestamp: startDate.toDateString()};
        this.logger.log(`Request: ${label}`, startContext);

        if (SHOW_INPUTS) {
            const hasBody = req.body && Object.keys(req.body).length > 0;
            const hasQuery = req.query && Object.keys(req.query).length > 0;
            if (hasBody || hasQuery) {
                const parts: string[] = [];
                if (hasQuery) parts.push(`query: ${truncate(req.query)}`);
                if (hasBody)  parts.push(`body: ${truncate(req.body)}`);
                this.logger.log(`[DEBUG INPUT] ${label}\n${parts.join('\n')}`, 'DebugLogging');
            }
        }
    }

    private _logEndMessage(loggerData: any, req: Request, res: Response, startDate: Date) {
        const duration = Date.now() - startDate.getTime();
        const label = `${req.method} ${req.originalUrl}`;
        const logEndContext = {
            ...loggerData, method: req.method, url: req.originalUrl, status_code: res.statusCode, duration_ms: duration
        };

        if (res.statusCode >= 500) {
            this.logger.error(`Response: ${label}`, logEndContext);
        } else if (res.statusCode >= 400) {
            this.logger.warn(`Response: ${label}`, logEndContext);
        } else {
            this.logger.log(`Response: ${label}`, logEndContext);
        }

        if (SHOW_OUTPUTS && req['debugResponseBody'] !== undefined) {
            this.logger.log(`[DEBUG OUTPUT] ${label}\n${truncate(req['debugResponseBody'])}`, 'DebugLogging');
        }
    }
}
