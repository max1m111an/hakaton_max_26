import { spawnSync } from "node:child_process";
import { Client } from "pg";

const BASELINE_MIGRATION = "0001_legacy_orthoepy_rename";
const PRISMA_BIN = "./node_modules/.bin/prisma";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

try {
    await client.connect();

    const history = await client.query(
        "SELECT to_regclass('public._prisma_migrations') AS table_name",
    );
    if (history.rows[0]?.table_name) {
        console.log("Migration history already exists, skipping baseline");
        process.exit(0);
    }

    const tables = await client.query(
        "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'",
    );
    if (tables.rows[0]?.count === 0) {
        console.log("Database has no tables, applying all migrations from scratch");
        process.exit(0);
    }

    console.log(
        `Found ${tables.rows[0].count} table(s) without migration history, marking ${BASELINE_MIGRATION} as applied`,
    );

    const resolved = spawnSync(
        PRISMA_BIN,
        [ "migrate", "resolve", "--applied", BASELINE_MIGRATION ],
        { stdio: "inherit" },
    );

    if (resolved.status !== 0) {
        console.error("Failed to baseline the existing database");
        process.exit(resolved.status ?? 1);
    }
}
catch (error) {
    console.error("Failed to inspect the database", error);
    process.exit(1);
}
finally {
    await client.end().catch(() => undefined);
}
