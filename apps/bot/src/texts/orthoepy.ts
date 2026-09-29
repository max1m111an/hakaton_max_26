import type { TrainingResult, TrainingWord } from "@bot/orthoepy-service.js";
import {
    ORTHOEPY_CORRECT_PREFIX,
    ORTHOEPY_DIFFICULT_HEADER,
    ORTHOEPY_DIFFICULT_TITLE,
    ORTHOEPY_EMPTY_TEXT,
    ORTHOEPY_MENU_TEXT,
    ORTHOEPY_NO_DIFFICULT_HINT,
    ORTHOEPY_NO_DIFFICULT_TITLE,
    ORTHOEPY_QUESTION_TEXT,
    ORTHOEPY_RESULT_ANSWERED,
    ORTHOEPY_RESULT_ALL_GOOD,
    ORTHOEPY_RESULT_CORRECT,
    ORTHOEPY_RESULT_ERRORS_HEADER,
    ORTHOEPY_RESULT_NO_ERRORS,
    ORTHOEPY_RESULT_STATS_TITLE,
    ORTHOEPY_RESULT_STATS_UPDATED,
    ORTHOEPY_RESULT_TITLE,
    ORTHOEPY_STATUS_CORRECT,
    ORTHOEPY_STATUS_INCORRECT,
} from "@assets/text/orthoepy.js";

export {
    ORTHOEPY_DIFFICULT_TITLE,
    ORTHOEPY_EMPTY_TEXT,
    ORTHOEPY_MENU_TEXT,
};

export function orthoepyQuestionText(word: string): string {
    return `${ORTHOEPY_QUESTION_TEXT} ${word.toUpperCase()}`;
}

export function orthoepyFeedbackText(
    isCorrect: boolean,
    correctWord: string,
    nextWord: string,
): string {
    const status = isCorrect ? ORTHOEPY_STATUS_CORRECT : ORTHOEPY_STATUS_INCORRECT;
    return `${status}\n\n${ORTHOEPY_CORRECT_PREFIX} ${correctWord}\n\n${orthoepyQuestionText(nextWord)}`;
}

export function orthoepyDifficultText(words: TrainingWord[]): string {
    if (words.length === 0) {
        return [
            ORTHOEPY_DIFFICULT_TITLE,
            "",
            ORTHOEPY_NO_DIFFICULT_TITLE,
            "",
            ORTHOEPY_NO_DIFFICULT_HINT,
        ].join("\n");
    }

    const list = words.map((word, index) => `${index + 1}) ${word.word}`).join("\n\n");
    return `${ORTHOEPY_DIFFICULT_TITLE}\n\n${ORTHOEPY_DIFFICULT_HEADER}\n\n${list}`;
}

export function trainingResultText(result: TrainingResult): string {
    const hasErrors = result.wrongWords.length > 0;
    const errorsSection = hasErrors
        ? [
            ORTHOEPY_RESULT_ERRORS_HEADER,
            "",
            result.wrongWords
                .map((word, index) => `${index + 1}) ${word}`)
                .join("\n\n"),
        ]
        : [ ORTHOEPY_RESULT_NO_ERRORS ];
    const statisticsMessage = hasErrors
        ? ORTHOEPY_RESULT_STATS_UPDATED
        : ORTHOEPY_RESULT_ALL_GOOD;

    return [
        ORTHOEPY_RESULT_TITLE,
        "",
        ORTHOEPY_RESULT_STATS_TITLE,
        `${ORTHOEPY_RESULT_ANSWERED} ${result.answered}`,
        `${ORTHOEPY_RESULT_CORRECT} ${result.correctAnswers}`,
        "",
        ...errorsSection,
        "",
        statisticsMessage,
    ].join("\n");
}
