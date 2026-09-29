import type { TrainingResult, VocabularyWord } from "@bot/vocabularies-service.js";
import { correctAnswerOf } from "@bot/vocabularies-service.js";
import {
    VOCABULARIES_CORRECT_PREFIX,
    VOCABULARIES_DIFFICULT_HEADER,
    VOCABULARIES_DIFFICULT_TITLE,
    VOCABULARIES_EMPTY_TEXT,
    VOCABULARIES_MENU_TEXT,
    VOCABULARIES_NO_DIFFICULT_HINT,
    VOCABULARIES_NO_DIFFICULT_TITLE,
    VOCABULARIES_QUESTION_TEXT,
    VOCABULARIES_RESULT_ANSWERED,
    VOCABULARIES_RESULT_ALL_GOOD,
    VOCABULARIES_RESULT_CORRECT,
    VOCABULARIES_RESULT_ERRORS_HEADER,
    VOCABULARIES_RESULT_NO_ERRORS,
    VOCABULARIES_RESULT_STATS_TITLE,
    VOCABULARIES_RESULT_STATS_UPDATED,
    VOCABULARIES_RESULT_TITLE,
    VOCABULARIES_STATUS_CORRECT,
    VOCABULARIES_STATUS_INCORRECT,
} from "@assets/text/vocabularies.js";

export {
    VOCABULARIES_DIFFICULT_TITLE,
    VOCABULARIES_EMPTY_TEXT,
    VOCABULARIES_MENU_TEXT,
};

function displayWord(word: string): string {
    return word.length === 0 ? word : word[0]!.toUpperCase() + word.slice(1);
}

export function vocabulariesQuestionText(inputWord: string): string {
    return `${VOCABULARIES_QUESTION_TEXT} ${inputWord}`;
}

export function vocabulariesFeedbackText(
    isCorrect: boolean,
    correctAnswer: string,
    nextInputWord: string,
): string {
    const status = isCorrect ? VOCABULARIES_STATUS_CORRECT : VOCABULARIES_STATUS_INCORRECT;
    return `${status}\n\n${VOCABULARIES_CORRECT_PREFIX} ${displayWord(correctAnswer)}\n\n${vocabulariesQuestionText(nextInputWord)}`;
}

export function vocabulariesDifficultText(words: VocabularyWord[]): string {
    if (words.length === 0) {
        return [
            VOCABULARIES_DIFFICULT_TITLE,
            "",
            VOCABULARIES_NO_DIFFICULT_TITLE,
            "",
            VOCABULARIES_NO_DIFFICULT_HINT,
        ].join("\n");
    }

    const list = words
        .map((word, index) => `${index + 1}. ${displayWord(correctAnswerOf(word))}`)
        .join("\n");

    return `${VOCABULARIES_DIFFICULT_TITLE}\n\n${VOCABULARIES_DIFFICULT_HEADER}\n\n${list}`;
}

export function vocabulariesResultText(result: TrainingResult): string {
    const hasErrors = result.wrongWords.length > 0;
    const errorsSection = hasErrors
        ? [
            VOCABULARIES_RESULT_ERRORS_HEADER,
            "",
            result.wrongWords
                .map((word, index) => `${index + 1}. ${displayWord(word)}`)
                .join("\n"),
        ]
        : [ VOCABULARIES_RESULT_NO_ERRORS ];
    const statisticsMessage = hasErrors
        ? VOCABULARIES_RESULT_STATS_UPDATED
        : VOCABULARIES_RESULT_ALL_GOOD;

    return [
        VOCABULARIES_RESULT_TITLE,
        "",
        VOCABULARIES_RESULT_STATS_TITLE,
        `${VOCABULARIES_RESULT_ANSWERED} ${result.answered}`,
        `${VOCABULARIES_RESULT_CORRECT} ${result.correctAnswers}`,
        "",
        ...errorsSection,
        "",
        statisticsMessage,
    ].join("\n");
}
