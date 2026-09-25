import type { RowList, Row } from "postgres";
import sql from "@database/db_engine.ts";

export type DBRequest = RowList<Row[]>;

export interface DBEntity {
    id: number;
};

export type DBInsert<T extends DBEntity> = {
    [K in keyof T as K extends "id" ? never : K]: T[K];
};

const identifierPattern = /^[a-z_][a-z0-9_]*$/i;

function identifier(value: string): string {
    if (!identifierPattern.test(value)) {
        throw new Error(`Invalid SQL identifier: ${value}`);
    }
    return value;
}

function placeholders(count: number): string {
    return Array.from({ length: count }, (_, index) => `$${index + 1}`).join(", ");
}

export function createSQLSchema<T extends DBEntity>(
    tablename: string,
    cols: readonly (keyof DBInsert<T>)[],
) {
    const table = identifier(tablename);
    const columns = cols.map((column) => identifier(String(column)));

    return {
        tablename,
        cols,

        get: async (id: number): Promise<T | null> => {
            const rows = await sql.unsafe<T[]>(
                `SELECT * FROM ${table} WHERE id = $1`,
                [ id ],
            );
            return rows[0] ?? null;
        },

        getAll: async (): Promise<T[]> => {
            return await sql.unsafe<T[]>(`SELECT * FROM ${table}`);
        },

        add: async function (request: DBInsert<T>): Promise<T> {
            let rows: T[];

            if (columns.length === 0) {
                rows = await sql.unsafe<T[]>(
                    `INSERT INTO ${table} DEFAULT VALUES RETURNING *`,
                );
            }
            else {
                const values = cols.map((column) => request[column]);
                rows = await sql.unsafe<T[]>(
                    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders(columns.length)}) RETURNING *`,
                    values as any[],
                );
            }

            const row = rows[0];
            if (!row) {
                throw new Error(`Could not insert a row into ${table}`);
            }
            return row;
        },
    };
}
