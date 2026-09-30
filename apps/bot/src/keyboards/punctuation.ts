import { Keyboard } from "@maxhub/max-bot-api";
import { CALLBACKS } from "@bot/constants/callbacks.js";

type InlineKeyboard = ReturnType<typeof Keyboard.inlineKeyboard>;

export function punctuationMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🧠 Тренировка", CALLBACKS.PUNCTUATION_TRAIN) ],
        [ Keyboard.button.callback("📕 Мои сложные правила", CALLBACKS.PUNCTUATION_DIFFICULT) ],
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.PUNCTUATION_BACK_TO_MAIN) ],
    ]);
}

export function backToPunctuationMenuKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.PUNCTUATION_BACK_TO_MENU) ],
    ]);
}

export function punctuationQuestionKeyboard(sessionId: string): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [
            Keyboard.button.callback(
                "🛑 Закончить",
                `${CALLBACKS.PUNCTUATION_FINISH_PREFIX}${sessionId}`,
            ),
        ],
    ]);
}

export function punctuationAnswerKeyboard(sessionId: string): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [
            Keyboard.button.callback(
                "📖 Подробнее",
                `${CALLBACKS.PUNCTUATION_EXPLAIN_PREFIX}${sessionId}`,
            ),
        ],
        [
            Keyboard.button.callback(
                "➡️ Следующее",
                `${CALLBACKS.PUNCTUATION_NEXT_PREFIX}${sessionId}`,
            ),
        ],
        [
            Keyboard.button.callback(
                "🛑 Закончить",
                `${CALLBACKS.PUNCTUATION_FINISH_PREFIX}${sessionId}`,
            ),
        ],
    ]);
}

export function punctuationExplanationKeyboard(sessionId: string): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [
            Keyboard.button.callback(
                "➡️ Следующее",
                `${CALLBACKS.PUNCTUATION_NEXT_PREFIX}${sessionId}`,
            ),
        ],
        [
            Keyboard.button.callback(
                "🛑 Закончить",
                `${CALLBACKS.PUNCTUATION_FINISH_PREFIX}${sessionId}`,
            ),
        ],
    ]);
}

export function punctuationResultKeyboard(): InlineKeyboard {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🔙 Назад", CALLBACKS.PUNCTUATION_BACK_TO_MENU) ],
    ]);
}
