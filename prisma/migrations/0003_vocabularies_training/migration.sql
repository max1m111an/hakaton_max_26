CREATE TABLE IF NOT EXISTS "vocabularies" (
    "id" BIGSERIAL NOT NULL,
    "input_word" TEXT,
    "answers" TEXT[],

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "vocabularies"
    ADD COLUMN IF NOT EXISTS "input_word" TEXT;

ALTER TABLE "vocabularies"
    ADD COLUMN IF NOT EXISTS "answers" TEXT[];

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'vocabularies'
            AND column_name = 'word'
    ) THEN
        EXECUTE 'UPDATE "vocabularies" SET "input_word" = COALESCE("input_word", "word")';
    END IF;
END
$$;

UPDATE "vocabularies"
SET "answers" = COALESCE("answers", ARRAY["input_word"]::TEXT[]);

ALTER TABLE "vocabularies"
    ALTER COLUMN "input_word" SET NOT NULL;

ALTER TABLE "vocabularies"
    ALTER COLUMN "answers" SET NOT NULL;

ALTER TABLE "vocabularies"
    DROP COLUMN IF EXISTS "word";

ALTER TABLE "vocabularies"
    DROP COLUMN IF EXISTS "value";

CREATE TABLE IF NOT EXISTS "vocabularies_wt" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "word_id" BIGINT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabularies_wt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vocabularies_wt_user_word_unique"
    ON "vocabularies_wt"("user_id", "word_id");

CREATE INDEX IF NOT EXISTS "vocabularies_wt_user_weight_idx"
    ON "vocabularies_wt"("user_id", "weight" DESC);

ALTER TABLE "vocabularies_wt"
    ADD CONSTRAINT "vocabularies_wt_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "vocabularies_wt"
    ADD CONSTRAINT "vocabularies_wt_word_id_fkey"
    FOREIGN KEY ("word_id") REFERENCES "vocabularies"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
