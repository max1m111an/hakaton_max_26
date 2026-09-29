import type { PunctuationResult, PunctuationTask, PositionVerdict } from "@bot/punctuation-service.js";
import { buildPunctuatedText } from "@bot/punctuation-service.js";
import {
    PUNCTUATION_ANSWER_HINT,
    PUNCTUATION_COMMA_NEEDED,
    PUNCTUATION_COMMA_NOT_NEEDED,
    PUNCTUATION_CORRECT_PREFIX,
    PUNCTUATION_DIFFICULT_HEADER,
    PUNCTUATION_DIFFICULT_TITLE,
    PUNCTUATION_EXPLANATION_TITLE,
    PUNCTUATION_INSTRUCTION,
    PUNCTUATION_MENU_TEXT,
    PUNCTUATION_NO_DIFFICULT_HINT,
    PUNCTUATION_NO_DIFFICULT_TITLE,
    PUNCTUATION_NO_RULES_TEXT,
    PUNCTUATION_NO_TASKS_TEXT,
    PUNCTUATION_POSITION_PREFIX,
    PUNCTUATION_RESULT_ANSWERED,
    PUNCTUATION_RESULT_ALL_GOOD,
    PUNCTUATION_RESULT_CORRECT,
    PUNCTUATION_RESULT_ERRORS_HEADER,
    PUNCTUATION_RESULT_NO_ERRORS,
    PUNCTUATION_RESULT_STATS_TITLE,
    PUNCTUATION_RESULT_STATS_UPDATED,
    PUNCTUATION_RESULT_TITLE,
    PUNCTUATION_RULE_PREFIX,
    PUNCTUATION_STATUS_CORRECT,
    PUNCTUATION_STATUS_INCORRECT,
} from "@assets/text/punctuation.js";

export {
    PUNCTUATION_DIFFICULT_TITLE,
    PUNCTUATION_INSTRUCTION,
    PUNCTUATION_MENU_TEXT,
    PUNCTUATION_NO_RULES_TEXT,
    PUNCTUATION_NO_TASKS_TEXT,
};

export function punctuationQuestionText(task: PunctuationTask): string {
    return [
        PUNCTUATION_INSTRUCTION,
        `"${task.maskedText}"`,
    ].join("\n");
}

export function punctuationAnswerHintText(): string {
    return PUNCTUATION_ANSWER_HINT;
}

export function punctuationResultText(
    task: PunctuationTask,
    isFullyCorrect: boolean,
): string {
    const status = isFullyCorrect ? PUNCTUATION_STATUS_CORRECT : PUNCTUATION_STATUS_INCORRECT;
    return [
        status,
        "",
        `${PUNCTUATION_CORRECT_PREFIX} ${buildPunctuatedText(task.maskedText, task.correctAnswers)}`,
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
        const mark = verdict.isCorrect ? PUNCTUATION_STATUS_CORRECT : PUNCTUATION_STATUS_INCORRECT;
        const need = verdict.commaNeeded ? PUNCTUATION_COMMA_NEEDED : PUNCTUATION_COMMA_NOT_NEEDED;

        return [
            `${mark} ${PUNCTUATION_POSITION_PREFIX} ${verdict.position} — ${need}`,
            `${PUNCTUATION_RULE_PREFIX} ${verdict.ruleText}`,
        ].join("\n");
    });

    return [
        PUNCTUATION_EXPLANATION_TITLE,
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
            PUNCTUATION_NO_DIFFICULT_TITLE,
            "",
            PUNCTUATION_NO_DIFFICULT_HINT,
        ].join("\n");
    }

    const list = rules.map((rule, index) => `${index + 1}. ${rule.ruleText}`).join("\n");
    return `${PUNCTUATION_DIFFICULT_TITLE}\n\n${PUNCTUATION_DIFFICULT_HEADER}\n\n${list}`;
}

export function punctuationSessionResultText(result: PunctuationResult): string {
    const hasErrors = result.wrongRules.length > 0;
    const errorsSection = hasErrors
        ? [
            PUNCTUATION_RESULT_ERRORS_HEADER,
            "",
            result.wrongRules
                .map((ruleText, index) => `${index + 1}. ${ruleText}`)
                .join("\n"),
        ]
        : [ PUNCTUATION_RESULT_NO_ERRORS ];
    const statisticsMessage = hasErrors
        ? PUNCTUATION_RESULT_STATS_UPDATED
        : PUNCTUATION_RESULT_ALL_GOOD;

    return [
        PUNCTUATION_RESULT_TITLE,
        "",
        PUNCTUATION_RESULT_STATS_TITLE,
        `${PUNCTUATION_RESULT_ANSWERED} ${result.answered}`,
        `${PUNCTUATION_RESULT_CORRECT} ${result.fullyCorrect}`,
        "",
        ...errorsSection,
        "",
        statisticsMessage,
    ].join("\n");
}
