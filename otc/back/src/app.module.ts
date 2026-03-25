import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import {HttpModule} from '@nestjs/axios';
import {CacheModule} from '@nestjs/cache-manager';
import {SourcesController} from './domain/sources/sources.controller';
import {KnexDatabaseProvider} from './utils/database/knex';
import {LinkedinAuthProvider} from './auth/linkedin/linkedin.provider';
import {PersistentStorageModule} from './utils/files/persistent-storage.module';
import {DBGetUser} from './auth/database/get';
import {ValuesController} from './domain/values/values.controller';
import {GetValuesService} from './domain/values/database/get-values/get-values.service';
import {FilesController} from './domain/files/files.controller';
import {FilesModule} from './domain/files/files.module';
import {GetSourcesService} from './domain/sources/database/get-sources/get-sources.service';
import { LinesController } from './domain/lines/lines.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OcrApiService } from './external-api/ocr/ocr-api.service';
import { OcrService } from './domain/sources/workflow/ocr/ocr.service';
import { ScraperApiService } from './external-api/scraper/scraper-api.service';
import { ScraperService } from './domain/sources/workflow/scraper/scraper.service';
import { CompletionController } from './domain/completion/completion.controller';
import { SourcesAuditController } from './domain/sources/sources-audit/sources-audit.controller';
import { SafeBrowsingService } from './domain/sources/workflow/url-safety/safe-browsing.service';
import { FileUrlScanService } from './domain/sources/workflow/url-safety/file-url-scan.service';
import { UrlService } from './external-api/url-safety/url.service';
import { GoogleSafeBrowsingApiService } from './external-api/url-safety/google-safe-browsing-api.service';
import { VirusTotalApiService } from './external-api/url-safety/virus-total-api.service';
import {AccessTokenService} from './auth/token-auditor/access-token.service';
import {AccessTokenController} from './domain/access-token-controller/access-token-controller';
import { SourceValidationService } from './domain/sources/database/source-validation/source-validation.service';
import { CreateSourceService } from './domain/sources/database/create-source/create-source.service';
import { AuthMiddleware } from './auth/auth.middleware';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApiUsageBufferService } from './utils/monitoring/audit/api-usage-buffer.service';
import { HttpExceptionFilter } from './utils/monitoring/errors/http-exception.filter';
import { LoggerMiddleware } from './utils/monitoring/logger/logger.middleware';
import { LoggerModule } from './utils/monitoring/logger/logger.module';
import { FileScanningService } from './domain/sources/workflow/file/file-scanning.service';
import { AiService } from './domain/sources/workflow/ai/ai.service';
import { AiTaskService } from './domain/sources/database/ai-task/ai-task.service';
import { monitoringMiddlewares, resolveMonitoringMode } from './utils/monitoring/monitoring-presets';
import {OTCAiApiService} from './external-api/ai/ai-api.service';

const controllers = [
    AppController,
    SourcesController,
    ValuesController,
    FilesController,
    LinesController,
    CompletionController,
    SourcesAuditController,
    AccessTokenController
]

const providers = [
    AppService,
    KnexDatabaseProvider,
    LinkedinAuthProvider,
    DBGetUser,
    GetValuesService,
    GetSourcesService,
    OcrApiService,
    OcrService,
    ScraperApiService,
    ScraperService,
    UrlService,
    GoogleSafeBrowsingApiService,
    VirusTotalApiService,
    SafeBrowsingService,
    FileUrlScanService,
    AccessTokenService,
    SourceValidationService,
    CreateSourceService,
    ApiUsageBufferService,
    FileScanningService,
    OTCAiApiService,
    AiService,
    AiTaskService,
    {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    },
    {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
    }
];

@Module({
  imports: [
      HttpModule,
      ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
      }),
      ThrottlerModule.forRoot({
          throttlers: [{ ttl: 1000, limit: 10 }],
      }),
      ScheduleModule.forRoot(),
      CacheModule.register(),
      LoggerModule,
      PersistentStorageModule,
      AuthModule,
      FilesModule
  ],
  controllers: [...controllers],
  providers: [...providers],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        const defaultMiddlewares = [AuthMiddleware, LoggerMiddleware];
        const extraMiddlewares = monitoringMiddlewares[resolveMonitoringMode()];

        consumer.apply(...extraMiddlewares, ...defaultMiddlewares).forRoutes('*');
    }
}
