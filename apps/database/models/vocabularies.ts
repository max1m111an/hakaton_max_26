import { createSQLSchema } from "@database/models/db_schema.ts";
import type { DBEntity, DBInsert } from "@database/models/db_schema.ts";


export interface VocabulariesModel extends DBEntity {
    word: string;
    value: number;
}

export type VocabulariesInsert = DBInsert<VocabulariesModel>;

export const VocabulariesSchema = createSQLSchema<VocabulariesModel>(
    "vocabularies",
    [ "word", "value" ],
);