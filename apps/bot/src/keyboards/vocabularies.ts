import { Keyboard } from "@maxhub/max-bot-api";
import { CALLBACKS } from "@bot/constants/callbacks.js";

type InlineKeyboard = ReturnType<typeof Keyboard.inlineKeyboard>;

export function vocabulariesMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🧠 Тренировка", CALLBACKS.VOCABULARIES_TRAIN) ],
        [ Keyboard.button.callback("📕 Мои сложные слова", CALLBACKS.VOCABULARIES_DIFFICULT) ],
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.VOCABULARIES_BACK_TO_MAIN) ],
    ]);
}

export function backToVocabulariesMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.VOCABULARIES_BACK_TO_MENU) ],
    ]);
}

export function vocabulariesQuestionKeyboard(
    wordId: number,
    options: string[],
    sessionId: string,
): InlineKeyboard {
    const rows = options.map((option, index) => [
        Keyboard.button.callback(
            option,
            `${CALLBACKS.VOCABULARIES_ANSWER_PREFIX}${sessionId}:${wordId}:${index}`,
        ),
    ]);

    rows.push([
        Keyboard.button.callback(
            "🛑 Закончить",
            `${CALLBACKS.VOCABULARIES_FINISH_PREFIX}${sessionId}`,
        ),
    ]);

    return Keyboard.inlineKeyboard(rows);
}
