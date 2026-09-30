import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import postgres from "postgres";
import { getEnv } from "@utils/env.ts";


const DB_SCHEME: string = getEnv("DB_SCHEME");
const DB_USER: string = getEnv("DB_USER");
const DB_PASS: string = getEnv("DB_PASS");
const DB_NAME: string = getEnv("DB_NAME");
const DB_HOST: string = getEnv("DB_HOST");
const DB_PORT: string = getEnv("DB_PORT");

const DB_URL: string = `${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

function resolveDatabaseUrl(): string {
    const fromEnv = process.env.DATABASE_URL;
    if (fromEnv) {
        return fromEnv;
    }
    const user = encodeURIComponent(DB_USER);
    const pass = encodeURIComponent(DB_PASS);
    return `postgresql://${user}:${pass}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const databaseUrl = resolveDatabaseUrl();
process.env.DATABASE_URL ??= databaseUrl;

const sql = postgres(DB_URL);

export const prisma = new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
});

export default sql;

/*
usage (Prisma):
import { prisma } from '@database/db_engine.ts';

const words = await prisma.orthoepy.findMany();
*/
