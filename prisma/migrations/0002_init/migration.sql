-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "orthoepy" (
    "id" BIGSERIAL NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "orthoepy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGINT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "orthoepy_wt" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "word_id" BIGINT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "orthoepy_wt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "punctuation" (
    "id" BIGSERIAL NOT NULL,
    "sentence" TEXT NOT NULL,
    "correct_sequence" INTEGER NOT NULL,

    CONSTRAINT "punctuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "vocabularies" (
    "id" BIGSERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orthoepy_wt_user_weight_idx" ON "orthoepy_wt"("user_id", "weight" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "orthoepy_wt_user_word_unique" ON "orthoepy_wt"("user_id", "word_id");

-- AddForeignKey
ALTER TABLE "orthoepy_wt" ADD CONSTRAINT "orthoepy_wt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orthoepy_wt" ADD CONSTRAINT "orthoepy_wt_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "orthoepy"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
