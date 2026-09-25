import type { Bot } from "@maxhub/max-bot-api";
import { MAIN_MENU_TEXT } from "../texts/main-menu.js";
import { mainMenuKeyboard } from "../keyboards/main-menu.js";


export function registerStart(bot: Bot): void {
    bot.command("start", (ctx) =>
        ctx.reply(MAIN_MENU_TEXT, { attachments: [ mainMenuKeyboard() ] }),
    );
}