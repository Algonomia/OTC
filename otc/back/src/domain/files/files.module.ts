import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {AuthModule} from '../../auth/auth.module';
import {LinkedinAuthProvider} from '../../auth/linkedin/linkedin.provider';
import {DBGetUser} from '../../auth/database/get';
import {FilesController} from './files.controller';
import {KnexDatabaseProvider} from '../../utils/database/knex';

@Module({
    imports: [
        HttpModule,
        AuthModule
    ],
    controllers: [FilesController],
    providers: [KnexDatabaseProvider, LinkedinAuthProvider, DBGetUser],
})
export class FilesModule {}
