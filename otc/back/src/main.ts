import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import {AppInjector} from './app.injector';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { createLogger } from './utils/monitoring/logger/logger.factory';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: createLogger(),
    });
    AppInjector.setApp(app); // important

    const config = app.get(ConfigService);
    const allowedOrigin = config.get<string>('CORS_ORIGIN');

    app.enableCors({
        origin: allowedOrigin,
        credentials: true
    });
    app.use(cookieParser());

    const apiDescription = readFileSync(join(__dirname, 'swagger', 'api-description.md'), 'utf-8');
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Open Tax Calendar API')
        .setDescription(apiDescription)
        .setVersion('1.0')
        .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
