import {KnexDatabaseProvider} from '../../utils/database/knex';
import {TUser} from '@otc/domain';
import {Injectable} from '@nestjs/common';

@Injectable()
export class DBUpdateUser {
    constructor(private readonly _database: KnexDatabaseProvider) {}

    async updateUser(user: {id: string} & Partial<TUser>): Promise<TUser[]> {
        return this._database.knex('auth_user')
            .update(user)
            .where('id', user.id)
            .returning('*')
    }

    async updateCGU(id: string): Promise<TUser[]> {
        return this._database.knex('auth_user')
            .update({cgu: true})
            .where('id', id)
            .returning('*')
    }
}
