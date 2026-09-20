import type { Bot } from "@maxhub/max-bot-api";
import { registerStart } from "./start.js";
import { registerMenu } from "./menu.js";


export function registerHandlers(bot: Bot): void {
    registerStart(bot);
    registerMenu(bot);
}