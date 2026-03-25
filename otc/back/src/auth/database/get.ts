import {KnexDatabaseProvider} from '../../utils/database/knex';
import {Injectable} from '@nestjs/common';
import {TUser} from '@otc/domain';
import {LinkedinAuthProvider} from '../linkedin/linkedin.provider';
import {ArrayUtils, TimeUnit} from '@algonomia/ts-shared';
import {CustomCache} from '../../utils/cache/custom-cache.decorator';

@Injectable()
export class DBGetUser {
    constructor(
        private readonly _database: KnexDatabaseProvider,
        private readonly _linkedin: LinkedinAuthProvider
    ) {}

    get(email: string): Promise<TUser> {
        return this._database.knex('auth_user')
            .select('*')
            .where('email', email)
            .first()
    }

    async isUserAdminOrTrusted(email: string) {
        const isAdmin = await this.getIsUserAdmin(email);
        if (isAdmin) {
            return true;
        }
        return this.isTrustedUser(email);
    }

    @CustomCache({
        baseKey: 'DBGetUser:getIsUserAdmin',
        ttl: 1,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: ((email: string) => email)
    })
    async getIsUserAdmin(email: string) {
        const req: {is_admin: boolean} | undefined = await this._database.knex('auth_user')
            .select('is_admin')
            .where('email', email)
            .first();
        if (!req) {
            return false;
        }
        return !!req?.is_admin;
    }

    @CustomCache({
        baseKey: 'DBGetUser:isTrustedUser',
        ttl: 1,
        ttlUnit: TimeUnit.minutes,
        keyBuilder: ((email: string) => email)
    })
    async isTrustedUser(email: string) {
        return (await this.getTrustedUsers([email])).length;
    }

    async getAdminOrTrustedUser(emails: string[]) {
        const adminOrTrustedss: {email: string}[][] = await Promise.all([
            this._database.knex('auth_user').select('email').where({is_admin: true}).whereIn('email', emails),
            this._database.knex('trusted_users').select('email').whereIn('email', emails)
        ]);
        return ArrayUtils.flattenUniques(adminOrTrustedss);
    }

    async getTrustedUsers(emails: string[]) {
        return this._database.knex('trusted_users').select('email').whereIn('email', emails);
    }
}
