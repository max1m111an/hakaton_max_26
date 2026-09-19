import { Bot } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const bot = new Bot(process.env.BOT_TOKEN!);


bot.command('start', (ctx) => ctx.reply('Добро пожаловать!'));

bot.on('message_created', (ctx) => ctx.reply('Новое сообщение'));

bot.start();
