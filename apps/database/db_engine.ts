import postgres from "postgres";
import { env } from "@utils/env.ts";

const DB_SCHEME: string = env.getEnv("DB_SCHEME");
const DB_USER: string = env.getEnv("DB_USER");
const DB_PASS: string = env.getEnv("DB_PASS");
const DB_NAME: string = env.getEnv("DB_NAME");
const DB_HOST: string = env.getEnv("DB_HOST");
const DB_PORT: string = env.getEnv("DB_PORT");

const DB_URL: string = `${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sql = postgres(DB_URL);
export default sql;

/*
usage:
import sql from '@/apps/database/db_engine';

export default async function getAllTable() {
  const result = await sql`SELECT * FROM table`;
}
*/