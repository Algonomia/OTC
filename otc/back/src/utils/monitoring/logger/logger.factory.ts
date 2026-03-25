import { LoggerService } from '@nestjs/common';
import pino from 'pino';
import { PinoLoggerService } from './pino-logger.service';
import { MonitoringMode, transports, resolveMonitoringMode } from '../monitoring-presets';

export const APP_LOGGER = 'APP_LOGGER';

export function createLogger(type?: MonitoringMode): LoggerService {
    const resolved = type ?? resolveMonitoringMode();

    const level = process.env.LOG_LEVEL || 'info';

    const pinoInstance = pino({
        level,
        transport: { targets: transports[resolved] ?? transports[MonitoringMode.custom] },
    });

    return new PinoLoggerService(pinoInstance);
}
