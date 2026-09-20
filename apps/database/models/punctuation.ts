import { createSQLSchema, DBEntity, DBInsert } from "@database/db_schema.ts";


export interface PunctuationModel extends DBEntity {
    sentence: string;
    correct_sequence: number;
}

export type PunctuationInsert = DBInsert<PunctuationModel>;

export const PunctuationSchema = createSQLSchema<PunctuationModel>(
    "punctuation",
    [ "sentence", "correct_sequence" ],
);