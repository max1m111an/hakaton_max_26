import { createSQLSchema } from "@database/models/db_schema.ts";
import type { DBEntity, DBInsert } from "@database/models/db_schema.ts";


export interface PunctuationModel extends DBEntity {
    sentence: string;
    correct_sequence: number;
}

export type PunctuationInsert = DBInsert<PunctuationModel>;

export const PunctuationSchema = createSQLSchema<PunctuationModel>(
    "punctuation",
    [ "sentence", "correct_sequence" ],
);