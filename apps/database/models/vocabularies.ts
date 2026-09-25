import { createSQLSchema, DBEntity, DBInsert } from "@database/db_schema.ts";


export interface VocabulariesModel extends DBEntity {
    word: string;
    value: number;
}

export type VocabulariesInsert = DBInsert<VocabulariesModel>;

export const VocabulariesSchema = createSQLSchema<VocabulariesModel>(
    "vocabularies",
    [ "word", "value" ],
);