import type { RowList, Row } from "postgres";
import sql from "@database/db_engine.ts";


export type DBRequest = RowList<Row[]>;

export interface DBEntity {
  id: number;
};

export type DBInsert<T extends DBEntity> = {
    [K in keyof T as K extends "id" ? never : K]: T[K];
};

export function createSQLSchema<T extends DBEntity>(
    tablename: string,
    cols: readonly (keyof DBInsert<T>)[],
) {
    return {
        tablename,
        cols,

        get: async (id: number): Promise<T | null> => {
            const rows = await sql<T[]>`
                  SELECT * FROM ${sql(tablename)} WHERE id = ${id}
              `;
            return rows[0] ?? null;
        },

        getAll: async (): Promise<T[]> => {
            return await sql<T[]>`SELECT * FROM ${sql(tablename)}`;
        },

        add: async function (request: DBInsert<T>): Promise<T> {
            const values = cols.map((col) => request[col]);

            const rows = await sql`
                INSERT INTO ${sql(tablename)} (${sql(cols as unknown as string[])})
                VALUES (${values as any[]})
                RETURNING *
            ` as T[];

            return rows[0];
        },
    };
}