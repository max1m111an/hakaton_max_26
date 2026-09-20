import { createSQLSchema, DBEntity, DBInsert } from "@database/db_schema.ts";


export interface OrthoepyModel extends DBEntity {
    word: string;
}

export type OrthoepyInsert = DBInsert<OrthoepyModel>;

export const OrthoepySchema = createSQLSchema<OrthoepyModel>(
    "orthoepy",
    [ "word" ],
);