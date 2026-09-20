import postgres from "postgres";
import { getEnv } from "@utils/env.ts";


const DB_SCHEME: string = getEnv("DB_SCHEME");
const DB_USER: string = getEnv("DB_USER");
const DB_PASS: string = getEnv("DB_PASS");
const DB_NAME: string = getEnv("DB_NAME");
const DB_HOST: string = getEnv("DB_HOST");
const DB_PORT: string = getEnv("DB_PORT");

const DB_URL: string = `${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sql = postgres(DB_URL);
export default sql;

/*
usage:
import sql from '@database/db_engine.ts';

export default async function getAll() {
  const result = await sql`SELECT * FROM table`;
}
*/