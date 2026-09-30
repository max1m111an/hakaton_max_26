import sql from "@database/db_engine.ts";

export async function ensureUser(userId: number): Promise<void> {
    await sql`
        INSERT INTO users (id)
        VALUES (${userId})
        ON CONFLICT (id) DO NOTHING
    `;
}
