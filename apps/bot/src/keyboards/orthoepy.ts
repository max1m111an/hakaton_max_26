import { Keyboard } from "@maxhub/max-bot-api";
import { CALLBACKS } from "@bot/constants/callbacks.js";

type InlineKeyboard = ReturnType<typeof Keyboard.inlineKeyboard>;

export function orthoepyMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🧠 Тренировка", CALLBACKS.ORTHOEPY_TRAIN) ],
        [ Keyboard.button.callback("📕 Мои сложные слова", CALLBACKS.ORTHOEPY_DIFFICULT) ],
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.ORTHOEPY_BACK_TO_MAIN) ],
    ]);
}

export function backToOrthoepyMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.ORTHOEPY_BACK_TO_MENU) ],
    ]);
}

export function backToMainMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.ORTHOEPY_BACK_TO_MAIN) ],
    ]);
}

export function trainingQuestionKeyboard(
    wordId: number,
    options: string[],
    sessionId: string,
): InlineKeyboard {
    const rows = options.map((option, index) => [
        Keyboard.button.callback(
            option,
            `${CALLBACKS.ORTHOEPY_ANSWER_PREFIX}${sessionId}:${wordId}:${index}`,
        ),
    ]);

    rows.push([
        Keyboard.button.callback(
            "Закончить",
            `${CALLBACKS.ORTHOEPY_FINISH_PREFIX}${sessionId}`,
        ),
    ]);

    return Keyboard.inlineKeyboard(rows);
}
