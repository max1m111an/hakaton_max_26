import { createSQLSchema } from "@database/models/db_schema.ts";
import type { DBEntity, DBInsert } from "@database/models/db_schema.ts";

export interface OrthoepyWtModel extends DBEntity {
    user_id: number;
    word_id: number;
    weight: number;
}

export type OrthoepyWtInsert = DBInsert<OrthoepyWtModel>;

export const OrthoepyWtSchema = createSQLSchema<OrthoepyWtModel>(
    "orthoepy_wt",
    [ "user_id", "word_id", "weight" ],
);
