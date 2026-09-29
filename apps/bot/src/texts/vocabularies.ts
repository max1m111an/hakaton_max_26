import type { TrainingResult, VocabularyWord } from "@bot/vocabularies-service.js";
import { correctAnswerOf } from "@bot/vocabularies-service.js";

export const VOCABULARIES_MENU_TEXT = "📝 Словарные слова\n\nВыбери режим тренировки:";
export const VOCABULARIES_EMPTY_TEXT = "В таблице словарных слов пока нет слов.";
export const VOCABULARIES_DIFFICULT_TITLE = "📕 Твой личный антирейтинг (Словарные слова)";

function displayWord(word: string): string {
    return word.length === 0 ? word : word[0]!.toUpperCase() + word.slice(1);
}

export function vocabulariesQuestionText(inputWord: string): string {
    return `Выбери корректное написание слово: ${inputWord}`;
}

export function vocabulariesFeedbackText(
    isCorrect: boolean,
    correctAnswer: string,
    nextInputWord: string,
): string {
    const status = isCorrect ? "✅ Верно!" : "❌ Ошибка!";
    return `${status}\n\nПравильно: ${displayWord(correctAnswer)}\n\n${vocabulariesQuestionText(nextInputWord)}`;
}

export function vocabulariesDifficultText(words: VocabularyWord[]): string {
    const list = words.length > 0
        ? words
            .map((word, index) => `${index + 1}. ${displayWord(correctAnswerOf(word))}`)
            .join("\n")
        : "Пока нет слов с положительным весом. Пройди тренировку, и здесь появятся твои сложные слова.";

    return `${VOCABULARIES_DIFFICULT_TITLE}\n\nЭто слова, которые даются тебе тяжелее всего:\n\n${list}`;
}

export function vocabulariesResultText(result: TrainingResult): string {
    const wrongWords = result.wrongWords.length > 0
        ? result.wrongWords
            .map((word, index) => `${index + 1}. ${displayWord(word)}`)
            .join("\n")
        : "Ошибок не было!";
    const statisticsMessage = result.wrongWords.length > 0
        ? "Я уже обновил твою статистику и повысил вес этих слов. В следующий раз мы обязательно их отработаем!"
        : "Твоя статистика обновлена. Отличная работа!";

    return [
        "🏁 Тренировка завершена!",
        "",
        "📊 Твои результаты за сессию:",
        `• Пройдено слов: ${result.answered}`,
        `• Верных ответов: ${result.correctAnswers}`,
        "",
        "⚠️ Слова, в которых ты ошибся сегодня:",
        "",
        wrongWords,
        "",
        statisticsMessage,
    ].join("\n");
}
