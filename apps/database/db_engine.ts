import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const DB_SCHEME: string = process.env.DB_SCHEME!;
const DB_USER: string = process.env.DB_USER!;
const DB_PASS: string = process.env.DB_PASS!;
const DB_NAME: string = process.env.DB_NAME!;
const DB_HOST: string = process.env.DB_HOST!;
const DB_PORT: string = process.env.DB_PORT!;

const DB_URL: string = `${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sql = postgres(DB_URL);
export default sql;

/*
usage:
import sql from '@/apps/database/db_engine';

export default async function ExpensesPage() {
  const expenses = await sql`SELECT * FROM expenses ORDER BY date DESC`;
}
*/