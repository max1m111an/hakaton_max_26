import type { Bot } from "@maxhub/max-bot-api";
import { ensureUser } from "../orthoepy-service.js";
import { MAIN_MENU_TEXT } from "../texts/main-menu.js";
import { mainMenuKeyboard } from "../keyboards/main-menu.js";

export function registerStart(bot: Bot): void {
    bot.command("start", async (ctx) => {
        const userId = ctx.update.message.sender?.user_id;
        if (userId !== undefined) {
            await ensureUser(userId);
        }

        return ctx.reply(MAIN_MENU_TEXT, { attachments: [ mainMenuKeyboard() ] });
    });
}
