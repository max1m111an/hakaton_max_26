import { prisma } from "@database/db_engine.ts";

let initialization: Promise<void> | undefined;

async function createSchema(): Promise<void> {
    await prisma.$connect();
}

export function initializeDatabase(): Promise<void> {
    initialization ??= createSchema();
    return initialization;
}
