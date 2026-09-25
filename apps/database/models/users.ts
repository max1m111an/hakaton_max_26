import { createSQLSchema } from "@database/models/db_schema.ts";
import type { DBEntity, DBInsert } from "@database/models/db_schema.ts";

export type UsersModel = DBEntity;

export type UserModel = UsersModel;
export type UsersInsert = DBInsert<UsersModel>;

export const UsersSchema = createSQLSchema<UsersModel>(
    "users",
    [],
);
