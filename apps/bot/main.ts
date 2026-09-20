import { Bot } from "@maxhub/max-bot-api";
import { env } from "../utils/env.js";
import { registerHandlers } from "./src/handlers/index.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const main = new Bot(env.getEnv("BOT_TOKEN"));

registerHandlers(main);

main.on("message_created", (ctx) => ctx.reply("Новое сообщение"));

main.start();