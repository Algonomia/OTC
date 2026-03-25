import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { metrics } from '@opentelemetry/api';
import { APP_NAME } from '../../../constants';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    private _meter = metrics.getMeter(APP_NAME);

    private _httpRequestDuration = this._meter.createHistogram('http_request_duration_ms', {
        description: 'Duration of HTTP requests in milliseconds',
        unit: 'ms',
    });

    private _httpRequestCount = this._meter.createCounter('http_request_count', {
        description: 'Total number of HTTP requests',
        unit: '1',
    });

    private _httpRequestErrors = this._meter.createCounter('http_request_errors', {
        description: 'Total number of HTTP request errors',
        unit: '1',
    });

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        const { method } = req;

        this._httpRequestCount.add(1, { method });

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const route = req.route?.path || 'unknown';
            const statusCode = res.statusCode;
            const isError = statusCode >= 400;

            this._httpRequestDuration.record(duration, {
                method,
                route,
                status_code: statusCode,
                status: isError ? 'error' : 'success',
            });

            if (isError) {
                this._httpRequestErrors.add(1, {
                    method,
                    route,
                    status_code: statusCode,
                });
            }
        });

        next();
    }
}
