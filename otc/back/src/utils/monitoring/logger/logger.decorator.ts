import {AppInjector} from '../../../app.injector';
import { APP_LOGGER } from './logger.factory';
import { LoggerService } from '@nestjs/common';

export type CronjobItemResult = {
    sourceId: number;
    success: boolean;
};

type CustomLogOptions<T extends any[], R = any> = {
    context: string;
    startMessage?: string | ((...args: T) => string);
    endMessage?: string | ((result: R, durationMs: number, ...args: T) => string);
};

export function SourceCronjobLog(jobName: string) {
    return CustomLog<[], CronjobItemResult[]>({
        context: jobName,
        startMessage: `Start ${jobName} cronjob`,
        endMessage: (results) => {
            const total = results.length;
            const failed = results.filter(x => !x.success).length;
            return total === 0
                ? `End ${jobName} cronjob. No sources to process`
                : `End ${jobName} cronjob. ${total} processed, ${failed} failed`;
        }
    });
}

export function CustomLog<T extends any[], R = any>(options: CustomLogOptions<T, R>) {
    return function (
        _target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>,
    ) {
        const originalMethod = descriptor.value!;

        descriptor.value = async function (...args: T): Promise<R> {
            const startTime = Date.now();

            logStartMessage(...args);
            try {
                const result = originalMethod.apply(this, args);
                const resolved = result instanceof Promise ? await result : result;

                logEndMessage(propertyKey, resolved, startTime, ...args);
                return resolved;
            } catch (error) {
                logErrorMessage(propertyKey, error, startTime);
                throw error;
            }
        };

        return descriptor;
    };

    function logStartMessage(...args: T) {
        if (options.startMessage) {
            const logger = AppInjector.get<LoggerService>(APP_LOGGER);
            const msg = typeof options.startMessage === 'function' ? options.startMessage(...args) : options.startMessage;
            logger.log(msg, { context: options.context });
        }
    }

    function logEndMessage(propertyKey: string, result: R, startTime: number, ...args: T) {
        const durationMs = Date.now() - startTime;

        if (options.endMessage) {
            const logger = AppInjector.get<LoggerService>(APP_LOGGER);
            const msg = typeof options.endMessage === 'function' ? options.endMessage(result, durationMs, ...args) : options.endMessage;
            logger.log(msg, {
                context: options.context,
                duration_ms: durationMs,
                method: propertyKey
            });
        }
    }

    function logErrorMessage(propertyKey: string, error: any, startTime: number) {
        const durationMs = Date.now() - startTime;
        const logger = AppInjector.get<LoggerService>(APP_LOGGER);
        logger.error(
            `${propertyKey} failed: ${error.message}`,
            {
                context: options.context,
                duration_ms: durationMs,
                method: propertyKey,
                error_message: error.message,
                error_stack: error.stack
            }
        );
    }
}
