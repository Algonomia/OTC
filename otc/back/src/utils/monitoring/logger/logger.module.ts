import { Global, Module } from '@nestjs/common';
import { APP_LOGGER, createLogger } from './logger.factory';

@Global()
@Module({
    providers: [{
        provide: APP_LOGGER,
        useFactory: () => createLogger(),
    }],
    exports: [APP_LOGGER],
})
export class LoggerModule {}
