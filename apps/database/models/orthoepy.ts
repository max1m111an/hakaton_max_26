import { createSQLSchema } from "@database/models/db_schema.ts";
import type { DBEntity, DBInsert } from "@database/models/db_schema.ts";


export interface OrthoepyModel extends DBEntity {
    word: string;
}

export type OrthoepyInsert = DBInsert<OrthoepyModel>;

export const OrthoepySchema = createSQLSchema<OrthoepyModel>(
    "orthoepy",
    [ "word" ],
);