import { PrismaClient } from "@prisma/client";
import {LongViewParsingUtils} from './parse/parse';
import {createSource} from './save/save_source';
import {createValues} from './save/save_values';
import {join} from 'path';

const prisma = new PrismaClient({
        log: [{
            level: 'query',
            emit: 'event'
        }, {
            emit: 'event',
            level: 'error',
        }, {
            emit: 'event',
            level: 'info',
        }, {
            emit: 'event',
            level: 'warn',
        }],
    });

async function main() {
    try {
        const file = join(__dirname, '..', 'assets', 'tax_calendar.xlsx');
        const longView = await LongViewParsingUtils.getLongViewParsedLines(file);
        await createSource(prisma, longView.sourceLines);
        await createValues(prisma, longView.valueLines);

        console.log('Database seeding completed successfully.');
    } catch (error) {
        console.error('Error during database seeding:', error);
    }
}

main();
