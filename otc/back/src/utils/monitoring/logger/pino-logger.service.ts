import { LoggerService } from '@nestjs/common';
import { Logger as PinoInstance } from 'pino';

export class PinoLoggerService implements LoggerService {
    constructor(private readonly pino: PinoInstance) {}

    log(message: any, ...optionalParams: any[]): void {
        try {
            const attrs = this._parseParams(optionalParams);
            this.pino.info(attrs ?? {}, String(message));
        } catch (e) {
            console.error('Logger failed to log:', e);
        }
    }

    error(message: any, ...optionalParams: any[]): void {
        try {
            const attrs = this._parseParams(optionalParams);
            this.pino.error(attrs ?? {}, String(message));
        } catch (e) {
            console.error('Logger failed to log:', e);
        }
    }

    warn(message: any, ...optionalParams: any[]): void {
        try {
            const attrs = this._parseParams(optionalParams);
            this.pino.warn(attrs ?? {}, String(message));
        } catch (e) {
            console.error('Logger failed to log:', e);
        }
    }

    debug(message: any, ...optionalParams: any[]): void {
        try {
            const attrs = this._parseParams(optionalParams);
            this.pino.debug(attrs ?? {}, String(message));
        } catch (e) {
            console.error('Logger failed to log:', e);
        }
    }

    verbose(message: any, ...optionalParams: any[]): void {
        try {
            const attrs = this._parseParams(optionalParams);
            this.pino.trace(attrs ?? {}, String(message));
        } catch (e) {
            console.error('Logger failed to log:', e);
        }
    }

    private _parseParams(optionalParams: any[]): Record<string, any> | undefined {
        if (!optionalParams.length) return undefined;
        const last = optionalParams[optionalParams.length - 1];
        if (typeof last === 'string') {
            return { context: last };
        }
        if (last instanceof Error) {
            return { err: last };
        }
        if (typeof last === 'object' && last !== null) {
            return last;
        }
        return undefined;
    }
}
