import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        if (request.headers['x-api-key']) {
            throw new ForbiddenException('This endpoint is not available via API key');
        }

        return true;
    }
}
