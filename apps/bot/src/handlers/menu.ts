import type { Bot } from "@maxhub/max-bot-api";
import { CALLBACKS } from "../constants/callbacks.js";
import { showOrthoepyMenu } from "./orthoepy.js";
import { showVocabulariesMenu } from "./vocabularies.js";

const MENU_SECTIONS = [
    { payload: CALLBACKS.MENU_PUNCTUATION, title: "Пунктуация" },
] as const;

export function registerMenu(bot: Bot): void {
    bot.action(CALLBACKS.MENU_ORTHOEPY, showOrthoepyMenu);
    bot.action(CALLBACKS.MENU_VOCAB, showVocabulariesMenu);

    for (const section of MENU_SECTIONS) {
        bot.action(section.payload, (ctx) =>
            ctx.answerOnCallback({
                message: { text: `Раздел «${section.title}» скоро будет доступен.` },
            }),
        );
    }
}
