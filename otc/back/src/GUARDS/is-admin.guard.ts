import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {DBGetUser} from '../auth/database/get';
import { AuthenticatedRequest } from 'src/auth/auth.middleware';

@Injectable()
export class IsAdminGuard implements CanActivate {
    constructor(
        private readonly _dbGetUser: DBGetUser
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const email = request.user?.email ?? '';

        try {
            const isAdmin: boolean = await this._dbGetUser.getIsUserAdmin(email);

            if (!isAdmin) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            console.error('Error in IsAdminGuard:', error);
            throw new UnauthorizedException();
        }
        return true;
    }
}
