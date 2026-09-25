import { Bot } from "@maxhub/max-bot-api";
import { initializeDatabase } from "@database/schema.ts";
import { getEnv } from "@utils/env.ts";
import { registerHandlers } from "@bot/handlers/index.js";

const main = new Bot(getEnv("BOT_TOKEN"));

async function startBot(): Promise<void> {
    await initializeDatabase();
    registerHandlers(main);
    await main.start();
}

void startBot().catch((error: unknown) => {
    console.error("Не удалось запустить бота", error);
    process.exitCode = 1;
});
