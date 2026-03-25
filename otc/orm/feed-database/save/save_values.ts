import { PrismaClient } from '@prisma/client';

export async function createValues(prisma: PrismaClient, lines: any[]) {
    try {
        await prisma.otcLLMValue.createMany({
            data: lines,
            skipDuplicates: true
        });

        // Reset sequence to max(id) + 1
        await prisma.$executeRawUnsafe(`
            SELECT setval(
              pg_get_serial_sequence('"otc_llm_value"', 'id'),
              (SELECT COALESCE(MAX(id), 0) + 1 FROM "otc_llm_value"),
              false
            )
        `);
    } catch (error) {
        console.error('Error creating values:', error);
        throw error;
    }
}

