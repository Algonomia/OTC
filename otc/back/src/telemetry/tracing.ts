import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { APP_NAME, APP_VERSION } from '../constants';
import { modesWithEnabledTracing, resolveMonitoringMode } from '../utils/monitoring/monitoring-presets';

if (modesWithEnabledTracing[resolveMonitoringMode()]) {

    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: APP_NAME,
        [ATTR_SERVICE_VERSION]: APP_VERSION,
    });

    const sdk = new NodeSDK({
        resource,
        traceExporter: new OTLPTraceExporter({
            url: `${endpoint}/v1/traces`,
        }),
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
                url: `${endpoint}/v1/metrics`,
            }),
            exportIntervalMillis: 60000,
        }),
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new NestInstrumentation(),
            new PgInstrumentation(),
            new PinoInstrumentation(),
        ],
    });

    sdk.start();

    const shutdown = () => {
        sdk.shutdown()
            .then(() => console.log('OTEL SDK shut down'))
            .catch((err) => console.error('OTEL SDK shutdown error', err));
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
