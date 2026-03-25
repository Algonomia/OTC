import { Global, Module, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PersistentStorageClient } from '@astorage/ts-client';
import { APP_LOGGER } from '../monitoring/logger/logger.factory';

@Global()
@Module({
    providers: [
        {
            provide: PersistentStorageClient,
            useFactory: (config: ConfigService, logger: LoggerService) =>
                new PersistentStorageClient(
                    config.get<string>('FILE_SERVICE_URL', 'http://localhost:3001'),
                    { error: (msg, ...args) => logger.error(msg, ...args) },
                ),
            inject: [ConfigService, APP_LOGGER],
        },
    ],
    exports: [PersistentStorageClient],
})
export class PersistentStorageModule {}
