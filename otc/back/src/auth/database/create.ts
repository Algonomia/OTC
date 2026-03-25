import {KnexDatabaseProvider} from '../../utils/database/knex';
import {Injectable} from '@nestjs/common';
import {ILinkedInUser, TUser, ZUserSchema} from '@otc/domain';
import {DBGetUser} from './get';
import { v7 as uuid7 } from 'uuid';

@Injectable()
export class DBCreateUser {
    constructor(
        private readonly _database: KnexDatabaseProvider,
        private readonly _getDb: DBGetUser
    ) {}

    async getOrCreate(user: ILinkedInUser): Promise<TUser> {
        const existing = await this._getDb.get(user.email);
        if (existing) {
            return existing;
        }
        return this._create(user);
    }

    private async _create(user: ILinkedInUser) {
        const [newUser] = await this._database.knex('auth_user')
            .insert(ZUserSchema.parse({
                id: uuid7(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                email_verified: user.email_verified,
                country: user.country,
                language: user.language,
                picture: user.picture,
                job: null,
                company: null,
                phone: null,
                pro_email: null,
                cgu: false
            }))
            .returning('*');

        return newUser;
    }
}
