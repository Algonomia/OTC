import { Knex, knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {DateUtils} from '@algonomia/ts-shared';

@Injectable()
export class KnexDatabaseProvider {
    static async selectWithEnumCast(
        db: Knex,
        tableName: string,
        enumCols: string[] = [],
        dateCols: string[] = []
    ) {
        const columnsInfo = await db(tableName).columnInfo();

        const columns = Object.keys(columnsInfo).map(col => {
            if (enumCols.includes(col)) {
                // Cast enum or enum[] to text[]
                return db.raw(`${col}::text[] as ??`, [col]);
            }
            return col;
        });

        const fromDb = await db.select(columns).from(tableName);
        fromDb.forEach(x => {
            dateCols.forEach(col => {
                if (x[col]) {
                    x[col] = new Date(x[col]);
                }
            })
        })

        return fromDb;
    }

    private readonly _knex: Knex;

    constructor(private readonly _configService: ConfigService) {
        this._knex = knex(({
            client: 'pg',
            connection: {
                connectionString: this._configService.get<string>('DATABASE_URL'),
                ssl: false,
                // ssl: this._configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
            }
        }));
    }

    get knex(): Knex {
        return this._knex;
    }
}
