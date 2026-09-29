import type { PunctuationResult, PunctuationTask, PositionVerdict } from "@bot/punctuation-service.js";
import { buildPunctuatedText } from "@bot/punctuation-service.js";

export const PUNCTUATION_MENU_TEXT = "✍️ Пунктуация\n\nВыбери режим тренировки:";
export const PUNCTUATION_NO_RULES_TEXT = "В таблице правил пунктуации пока нет ни одного правила.";
export const PUNCTUATION_NO_TASKS_TEXT = "В таблице предложений пока нет ни одного предложения.";
export const PUNCTUATION_DIFFICULT_TITLE = "📕 Твой личный антирейтинг (Пунктуация)";
export const PUNCTUATION_INSTRUCTION = "Расставь запятые. Отправь слитно номера позиций, где нужна запятая, без пробелов и знаков:";

export function punctuationQuestionText(task: PunctuationTask): string {
    return [
        PUNCTUATION_INSTRUCTION,
        `"${task.maskedText}"`,
    ].join("\n");
}

export function punctuationAnswerHintText(): string {
    return "Отправь только цифры слитно, без пробелов, запятых и других символов. Например: 125";
}

export function punctuationResultText(
    task: PunctuationTask,
    isFullyCorrect: boolean,
): string {
    const status = isFullyCorrect ? "✅ Верно!" : "❌ Ошибка!";
    return [
        status,
        "",
        `Правильно: ${buildPunctuatedText(task.maskedText, task.correctAnswers)}`,
    ].join("\n");
}

export function punctuationUserText(
    task: PunctuationTask,
    verdicts: PositionVerdict[],
): string {
    const wrong = new Set(verdicts.filter((verdict) => !verdict.isCorrect).map((verdict) => verdict.position));

    return task.maskedText
        .replace(/\((\d+)\)/g, (match, position: string) => (wrong.has(Number(position)) ? match : ""))
        .replace(/\s{2,}/g, " ")
        .trim();
}

export function punctuationExplanationText(
    task: PunctuationTask,
    verdicts: PositionVerdict[],
): string {
    const lines = verdicts.map((verdict) => {
        const mark = verdict.isCorrect ? "✅" : "❌";
        const need = verdict.commaNeeded ? "запятая нужна" : "запятая не нужна";

        return [
            `${mark} Позиция ${verdict.position} — ${need}`,
            `📖 ${verdict.ruleText}`,
        ].join("\n");
    });

    return [
        "📖 Подробный разбор",
        "",
        punctuationUserText(task, verdicts),
        "",
        ...lines,
    ].join("\n");
}

export function punctuationDifficultText(
    rules: { ruleText: string }[],
): string {
    if (rules.length === 0) {
        return [
            PUNCTUATION_DIFFICULT_TITLE,
            "",
            "Пока не выявлено трудных правил.",
            "",
            "Пройди тренировку, и здесь появятся твои сложные правила.",
        ].join("\n");
    }

    const list = rules.map((rule, index) => `${index + 1}. ${rule.ruleText}`).join("\n");
    return `${PUNCTUATION_DIFFICULT_TITLE}\n\nЭто правила, которые даются тебе тяжелее всего:\n\n${list}`;
}

export function punctuationSessionResultText(result: PunctuationResult): string {
    const hasErrors = result.wrongRules.length > 0;
    const errorsSection = hasErrors
        ? [
            "⚠️ Правила, в которых ты ошибался:",
            "",
            result.wrongRules
                .map((ruleText, index) => `${index + 1}. ${ruleText}`)
                .join("\n"),
        ]
        : [ "✅ Ошибок не было!" ];
    const statisticsMessage = hasErrors
        ? "Я уже обновил твою статистику и повысил вес этих правил. В следующий раз мы обязательно отработаем предложения с ними!"
        : "Твоя статистика обновлена. Отличная работа!";

    return [
        "🏁 Тренировка завершена!",
        "",
        "📊 Твои результаты за сессию:",
        `• Пройдено предложений: ${result.answered}`,
        `• Полностью верных ответов: ${result.fullyCorrect}`,
        "",
        ...errorsSection,
        "",
        statisticsMessage,
    ].join("\n");
}
