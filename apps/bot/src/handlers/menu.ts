import type { Bot } from "@maxhub/max-bot-api";
import { CALLBACKS } from "../constants/callbacks.js";


const MENU_SECTIONS = [
    { payload: CALLBACKS.MENU_ORTHOEPY, title: "Орфоэпия" },
    { payload: CALLBACKS.MENU_VOCAB, title: "Словарные слова" },
    { payload: CALLBACKS.MENU_PUNCTUATION, title: "Пунктуация" },
] as const;

export function registerMenu(bot: Bot): void {
    for (const section of MENU_SECTIONS) {
        bot.action(section.payload, (ctx) =>
            ctx.answerOnCallback({
                message: { text: `Раздел «${section.title}» скоро будет доступен.` },
            }),
        );
    }
}