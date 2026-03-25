import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './GUARDS/auth.guard';
import { PersistentStorageClient } from '@astorage/ts-client';
import {AuditTestGuard} from './GUARDS/audit-test.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
    constructor(private _persistentStorageClient: PersistentStorageClient) {}

    @Get('ping')
    ping() {
        return { message: 'pong' };
    }

    @UseGuards(AuthGuard)
    @Get('ping-auth')
    isConnected() {
        return { message: 'You are connected!' };
    }

    @Get('ping-storage')
    @UseGuards(AuditTestGuard)
    async pingStorage() {
        return this._persistentStorageClient.ping();
    }
}
