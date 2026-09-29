import type { Bot } from "@maxhub/max-bot-api";
import { CALLBACKS } from "@bot/constants/callbacks.js";
import { showOrthoepyMenu } from "@bot/handlers/orthoepy.js";
import { showVocabulariesMenu } from "@bot/handlers/vocabularies.js";
import { showPunctuationMenu } from "@bot/handlers/punctuation.js";

export function registerMenu(bot: Bot): void {
    bot.action(CALLBACKS.MENU_ORTHOEPY, showOrthoepyMenu);
    bot.action(CALLBACKS.MENU_VOCAB, showVocabulariesMenu);
    bot.action(CALLBACKS.MENU_PUNCTUATION, showPunctuationMenu);
}
