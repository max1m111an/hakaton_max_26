-- CreateTable
CREATE TABLE IF NOT EXISTS "punctuation_rules" (
    "id" BIGSERIAL NOT NULL,
    "rule_text" TEXT NOT NULL,

    CONSTRAINT "punctuation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "punctuation_tasks" (
    "id" BIGSERIAL NOT NULL,
    "masked_text" TEXT NOT NULL,
    "correct_answers" INTEGER[] NOT NULL,
    "explanations" JSONB NOT NULL,

    CONSTRAINT "punctuation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_rule_weights" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "rule_id" BIGINT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_rule_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_rule_weights_user_rule_unique"
    ON "user_rule_weights"("user_id", "rule_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_rule_weights_user_weight_idx"
    ON "user_rule_weights"("user_id", "weight" DESC);

-- AddForeignKey
ALTER TABLE "user_rule_weights"
    ADD CONSTRAINT "user_rule_weights_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_rule_weights"
    ADD CONSTRAINT "user_rule_weights_rule_id_fkey"
    FOREIGN KEY ("rule_id") REFERENCES "punctuation_rules"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Устаревшая таблица из первоначальной схемы, заменена punctuation_tasks
DROP TABLE IF EXISTS "punctuation";
