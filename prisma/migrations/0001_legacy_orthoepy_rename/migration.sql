-- Совместимость со старой схемой: таблица "Orthoepy" (с заглавной буквы)
-- переименовывается в orthoepy, либо её строки вливаются в существующую
-- orthoepy без дублей. На свежих базах — no-op.
DO $$
BEGIN
    IF to_regclass('public."Orthoepy"') IS NOT NULL THEN
        IF to_regclass('public."orthoepy"') IS NULL THEN
            EXECUTE 'ALTER TABLE "Orthoepy" RENAME TO orthoepy';
        ELSE
            INSERT INTO orthoepy (word)
            SELECT legacy.word
            FROM "Orthoepy" AS legacy
            WHERE NOT EXISTS (
                SELECT 1
                FROM orthoepy AS current_word
                WHERE current_word.word = legacy.word
            );
        END IF;
    END IF;
END
$$;
