import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { TUser } from '@otc/domain';
import {DBGetUser} from '../auth/database/get';
import { AuthenticatedRequest } from '../auth/auth.middleware';

@Injectable()
export class ProfileCompletionGuard implements CanActivate {
    constructor(private readonly _dbGetUser: DBGetUser) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const email = request.user?.email ?? '';

        try {
            const userInfo: TUser = await this._dbGetUser.get(email);

            if (!userInfo?.job || !userInfo?.phone || !userInfo?.pro_email || !userInfo?.company || !userInfo?.cgu) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            console.error('Error in ProfileCompletionGuard:', error);
            throw new UnauthorizedException('Invalid authentication token');
        }
        return true;
    }
}
