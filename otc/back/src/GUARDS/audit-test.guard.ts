import {
    CanActivate,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuditTestGuard implements CanActivate {
    constructor(private _configservice: ConfigService) { }

    async canActivate(): Promise<boolean> {
        const isAuditable = this._configservice.get<boolean>('IS_AUDITABLE');
        if (!isAuditable) {
            throw new NotFoundException();
        }
        return true;
    }
}
