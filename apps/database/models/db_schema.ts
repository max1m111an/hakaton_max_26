import type { RowList, Row } from "postgres";
import sql from "@database/db_engine.ts";


export type DBRequest = RowList<Row[]>;

export interface DBEntity {
  id: number;
};

export type DBInsert<T extends DBEntity> = Omit<T, "id">;

import sql from "@database/db_engine.ts";
import type { DBRequest, DBEntity, DBInsert } from "./types.ts";

export function createSQLSchema<T extends DBEntity>(
    tablename: string,
    cols: readonly (keyof T)[],
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

        add: async (request: DBInsert<T>): Promise<T> => {
            const values = cols.map((col) => (request as DBInsert<T>)[col]);

            const rows = await sql<T[]>`
            INSERT INTO ${sql(tablename)} (${sql(cols as string[])})
            VALUES (${values})
            RETURNING *
            `;
            return rows[0];
        },
    };
}