import { PrismaClient } from '@prisma/client';

export async function createSource(prisma: PrismaClient, lines: any[]) {
    try {
        await prisma.source.createMany({
            data: lines,
            skipDuplicates: true
        });

        // Reset sequence to max(id) + 1
        await prisma.$executeRawUnsafe(`
            SELECT setval(
              pg_get_serial_sequence('"source"', 'id'),
              (SELECT COALESCE(MAX(id), 0) + 1 FROM "source"),
              false
            )
        `);
    } catch (error) {
        console.error('Error creating source:', error);
        throw error;
    }
}

