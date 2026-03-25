import { Type } from '@nestjs/common';
import { join } from 'path';
import pino from 'pino';
import { APP_NAME, APP_VERSION } from '../../constants';
import { MetricsMiddleware } from './telemetry/metrics.middleware';

export enum MonitoringMode {
    custom = 'custom',
    otel   = 'otel',
    mixed  = 'mixed',
}

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

const prettyTransport: pino.TransportTargetOptions = {
    target: join(__dirname, 'logger', 'custom-pretty.transport'),
    options: { colorize: true },
};

const otelTransport: pino.TransportTargetOptions = {
    target: 'pino-opentelemetry-transport',
    options: {
        logRecordProcessorOptions: {
            recordProcessorType: 'batch',
            exporterOptions: {
                protocol: 'http',
                httpExporterOptions: { url: `${OTEL_ENDPOINT}/v1/logs` },
            },
        },
        resourceAttributes: {
            'service.name': APP_NAME,
            'service.version': APP_VERSION,
        },
    },
};

export const transports: { [key in MonitoringMode]: pino.TransportTargetOptions[] } = {
    [MonitoringMode.custom]: [prettyTransport],
    [MonitoringMode.otel]:   [otelTransport],
    [MonitoringMode.mixed]:  [prettyTransport, otelTransport],
};

export const monitoringMiddlewares: { [key in MonitoringMode]: Type[] } = {
    [MonitoringMode.custom]: [],
    [MonitoringMode.otel]:   [MetricsMiddleware],
    [MonitoringMode.mixed]:  [MetricsMiddleware],
};

export const modesWithEnabledTracing: { [key in MonitoringMode]: boolean } = {
    [MonitoringMode.custom]: false,
    [MonitoringMode.otel]:   true,
    [MonitoringMode.mixed]:  true,
};

export function resolveMonitoringMode(): MonitoringMode {
    const env = process.env.LOGGER_TYPE as MonitoringMode | undefined;
    return env && env in MonitoringMode ? env : MonitoringMode.custom;
}
