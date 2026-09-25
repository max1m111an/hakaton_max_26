import type { TrainingResult, TrainingWord } from "@bot/orthoepy-service.js";

export const ORTHOEPY_MENU_TEXT = "🗣 Орфоэпия\n\nВыбери режим тренировки:";
export const ORTHOEPY_EMPTY_TEXT = "В таблице орфоэпии пока нет слов.";
export const ORTHOEPY_DIFFICULT_TITLE = "📕 Твой личный антирейтинг (Орфоэпия)";

export function orthoepyQuestionText(word: string): string {
    return `Выбери правильное ударение: ${word.toUpperCase()}`;
}

export function orthoepyFeedbackText(
    isCorrect: boolean,
    correctWord: string,
    nextWord: string,
): string {
    const status = isCorrect ? "✅ Верно!" : "❌ Ошибка!";
    return `${status}\n\nПравильно: ${correctWord}\n\n${orthoepyQuestionText(nextWord)}`;
}

export function orthoepyDifficultText(words: TrainingWord[]): string {
    const list = words.length > 0
        ? words.map((word, index) => `${index + 1}. ${word.word}`).join("\n\n")
        : "Пока нет слов с положительным весом. Пройди тренировку, и здесь появятся твои сложные слова.";

    return `${ORTHOEPY_DIFFICULT_TITLE}\n\nЭто слова, которые даются тебе тяжелее всего:\n\n${list}`;
}

export function trainingResultText(result: TrainingResult): string {
    const wrongWords = result.wrongWords.length > 0
        ? result.wrongWords.join("\n\n")
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
