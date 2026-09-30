import type { Bot } from "@maxhub/max-bot-api";
import { registerStart } from "@bot/handlers/start.js";
import { registerMenu } from "@bot/handlers/menu.js";
import { registerOrthoepy } from "@bot/handlers/orthoepy.js";
import { registerVocabularies } from "@bot/handlers/vocabularies.js";
import { registerPunctuation } from "@bot/handlers/punctuation.js";

export function registerHandlers(bot: Bot): void {
    registerStart(bot);
    registerMenu(bot);
    registerOrthoepy(bot);
    registerVocabularies(bot);
    registerPunctuation(bot);
}
