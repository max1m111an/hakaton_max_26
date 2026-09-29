import type { Bot } from "@maxhub/max-bot-api";
import { CALLBACKS } from "../constants/callbacks.js";
import { showOrthoepyMenu } from "./orthoepy.js";
import { showVocabulariesMenu } from "./vocabularies.js";
import { showPunctuationMenu } from "./punctuation.js";

export function registerMenu(bot: Bot): void {
    bot.action(CALLBACKS.MENU_ORTHOEPY, showOrthoepyMenu);
    bot.action(CALLBACKS.MENU_VOCAB, showVocabulariesMenu);
    bot.action(CALLBACKS.MENU_PUNCTUATION, showPunctuationMenu);
}
