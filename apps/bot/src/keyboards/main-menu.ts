import { Keyboard } from "@maxhub/max-bot-api";
import { CALLBACKS } from "@bot/constants/callbacks.js";


export function mainMenuKeyboard(): ReturnType<typeof Keyboard.inlineKeyboard> {
    return Keyboard.inlineKeyboard([
        [ Keyboard.button.callback("🗣 Орфоэпия", CALLBACKS.MENU_ORTHOEPY) ],
        [ Keyboard.button.callback("📝 Словарные слова", CALLBACKS.MENU_VOCAB) ],
        [ Keyboard.button.callback("✍️ Пунктуация", CALLBACKS.MENU_PUNCTUATION) ],
    ]);
}