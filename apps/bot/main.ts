import { Bot } from "@maxhub/max-bot-api";
import { env } from "./src/env.js";
import { registerHandlers } from "./src/handlers/index.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const main = new Bot(env.botToken);

registerHandlers(main);

main.on("message_created", (ctx) => ctx.reply("Новое сообщение"));

main.start();