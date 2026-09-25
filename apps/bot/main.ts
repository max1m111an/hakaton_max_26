import { Bot } from "@maxhub/max-bot-api";
import { getEnv } from "@utils/env.ts";
import { registerHandlers } from "@bot/handlers/index.js";
const main = new Bot(getEnv("BOT_TOKEN"));

registerHandlers(main);

main.on("message_created", (ctx) => ctx.reply("Новое сообщение"));

main.start();