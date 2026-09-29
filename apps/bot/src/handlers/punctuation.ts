import type { Bot, Context } from "@maxhub/max-bot-api";
import { Keyboard } from "@maxhub/max-bot-api";
import {
    CALLBACKS,
    PUNCTUATION_EXPLAIN_PATTERN,
    PUNCTUATION_FINISH_PATTERN,
    PUNCTUATION_NEXT_PATTERN,
} from "../constants/callbacks.js";
import {
    advanceTask,
    applyVerdictWeights,
    clearSession,
    createSession,
    evaluateTask,
    finishSession,
    getSession,
    hasAnyRule,
    loadDifficultRules,
    parsePositions,
    pickNextTask,
    positionsOf,
    recordAnswer,
} from "../punctuation-service.js";
import type { PunctuationSession } from "../punctuation-service.js";
import {
    backToPunctuationMenuKeyboard,
    punctuationAnswerKeyboard,
    punctuationExplanationKeyboard,
    punctuationMenuKeyboard,
    punctuationQuestionKeyboard,
    punctuationResultKeyboard,
} from "../keyboards/punctuation.js";
import {
    PUNCTUATION_MENU_TEXT,
    PUNCTUATION_NO_RULES_TEXT,
    PUNCTUATION_NO_TASKS_TEXT,
    punctuationAnswerHintText,
    punctuationDifficultText,
    punctuationExplanationText,
    punctuationQuestionText,
    punctuationResultText,
    punctuationSessionResultText,
} from "../texts/punctuation.js";
import { MAIN_MENU_TEXT } from "../texts/main-menu.js";
import { mainMenuKeyboard } from "../keyboards/main-menu.js";

type InlineKeyboard = ReturnType<typeof Keyboard.inlineKeyboard>;

async function acknowledgeCallback(ctx: Context): Promise<void> {
    try {
        await ctx.answerOnCallback({});
    }
    catch (error) {
        void error;
    }
}

function getUserId(ctx: Context): number {
    const userId = ctx.user?.user_id;
    if (userId === undefined) {
        throw new Error("The update does not contain a user");
    }
    return userId;
}

async function replaceMessage(
    ctx: Context,
    text: string,
    keyboard: InlineKeyboard,
): Promise<void> {
    await acknowledgeCallback(ctx);
    const extra = { text, attachments: [ keyboard ] };

    if (ctx.messageId) {
        try {
            const response = await ctx.editMessage(extra);
            if (response.success) {
                return;
            }
        }
        catch {
            await ctx.reply(text, extra);
            return;
        }
    }

    await ctx.reply(text, extra);
}

async function showMainMenu(ctx: Context): Promise<void> {
    await replaceMessage(ctx, MAIN_MENU_TEXT, mainMenuKeyboard());
}

export async function showPunctuationMenu(ctx: Context): Promise<void> {
    await replaceMessage(ctx, PUNCTUATION_MENU_TEXT, punctuationMenuKeyboard());
}

async function showDifficultRules(ctx: Context, userId: number): Promise<void> {
    const rules = await loadDifficultRules(userId);
    await replaceMessage(
        ctx,
        punctuationDifficultText(rules),
        backToPunctuationMenuKeyboard(),
    );
}

async function askQuestion(
    ctx: Context,
    session: PunctuationSession,
): Promise<void> {
    await replaceMessage(
        ctx,
        punctuationQuestionText(session.task),
        punctuationQuestionKeyboard(session.id),
    );
}

async function startTraining(ctx: Context, userId: number): Promise<void> {
    if (!await hasAnyRule()) {
        await replaceMessage(ctx, PUNCTUATION_NO_RULES_TEXT, backToPunctuationMenuKeyboard());
        return;
    }

    const task = await pickNextTask(userId);
    if (!task) {
        await replaceMessage(ctx, PUNCTUATION_NO_TASKS_TEXT, backToPunctuationMenuKeyboard());
        return;
    }

    await askQuestion(ctx, createSession(userId, task));
}

async function goToNextQuestion(ctx: Context, userId: number): Promise<void> {
    const current = getSession(userId);
    const task = await pickNextTask(userId, current?.task.id);
    if (!task) {
        await replaceMessage(ctx, PUNCTUATION_NO_TASKS_TEXT, backToPunctuationMenuKeyboard());
        clearSession(userId);
        return;
    }

    await askQuestion(ctx, advanceTask(userId, task));
}

async function handleAnswerText(ctx: Context, text: string | null | undefined): Promise<void> {
    if (text === null || text === undefined) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getSession(userId);
    if (!session) {
        return;
    }

    if (session.evaluation !== null) {
        await ctx.reply(
            "Это предложение уже засчитано. Нажми «➡️ Следующее», чтобы взять следующее, или «🛑 Закончить».",
            { attachments: [ punctuationAnswerKeyboard(session.id) ] },
        );
        return;
    }

    const positions = parsePositions(text);
    if (positions === null) {
        await ctx.reply(punctuationAnswerHintText(), {
            attachments: [ punctuationQuestionKeyboard(session.id) ],
        });
        return;
    }

    const available = new Set(positionsOf(session.task));
    if (positions.some((position) => !available.has(position))) {
        await ctx.reply(
            `В этом предложении есть позиции: ${[ ...available ].join(", ")}. Ответь только этими цифрами слитно.`,
            { attachments: [ punctuationQuestionKeyboard(session.id) ] },
        );
        return;
    }

    const evaluation = await evaluateTask(session.task, positions);
    await applyVerdictWeights(userId, evaluation);
    recordAnswer(session, evaluation);

    const answerText = punctuationResultText(session.task, evaluation.isFullyCorrect);
    const previousKeyboard = session.evaluation === null
        ? punctuationQuestionKeyboard(session.id)
        : punctuationAnswerKeyboard(session.id);

    if (ctx.messageId) {
        try {
            const response = await ctx.editMessage({
                text: answerText,
                attachments: [ previousKeyboard ],
            });
            if (response.success) {
                return;
            }
        }
        catch {
            await ctx.reply(answerText, { attachments: [ previousKeyboard ] });
            return;
        }
    }

    await ctx.reply(answerText, { attachments: [ previousKeyboard ] });
}

async function handleExplain(ctx: Context): Promise<void> {
    const sessionId = ctx.match?.[1];
    if (!sessionId) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getSession(userId);
    if (!session || session.id !== sessionId || !session.evaluation) {
        return;
    }

    await replaceMessage(
        ctx,
        punctuationExplanationText(session.task, session.evaluation.verdicts),
        punctuationExplanationKeyboard(session.id),
    );
}

async function handleNext(ctx: Context): Promise<void> {
    const sessionId = ctx.match?.[1];
    if (!sessionId) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getSession(userId);
    if (!session || session.id !== sessionId) {
        return;
    }

    await goToNextQuestion(ctx, userId);
}

async function handleFinish(ctx: Context): Promise<void> {
    const sessionId = ctx.match?.[1];
    if (!sessionId) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getSession(userId);
    if (!session || session.id !== sessionId) {
        return;
    }

    const result = await finishSession(userId);
    if (result) {
        await replaceMessage(
            ctx,
            punctuationSessionResultText(result),
            punctuationResultKeyboard(),
        );
    }
}

export function registerPunctuation(bot: Bot): void {
    bot.action(CALLBACKS.MENU_PUNCTUATION, showPunctuationMenu);

    bot.action(CALLBACKS.PUNCTUATION_TRAIN, async (ctx) => {
        await startTraining(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.PUNCTUATION_DIFFICULT, async (ctx) => {
        await showDifficultRules(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.PUNCTUATION_BACK_TO_MAIN, async (ctx) => {
        await showMainMenu(ctx);
    });

    bot.action(CALLBACKS.PUNCTUATION_BACK_TO_MENU, async (ctx) => {
        await showPunctuationMenu(ctx);
    });

    bot.action(PUNCTUATION_EXPLAIN_PATTERN, async (ctx) => {
        await handleExplain(ctx);
    });

    bot.action(PUNCTUATION_NEXT_PATTERN, async (ctx) => {
        await handleNext(ctx);
    });

    bot.action(PUNCTUATION_FINISH_PATTERN, async (ctx) => {
        await handleFinish(ctx);
    });

    bot.on("message_created", async (ctx) => {
        await handleAnswerText(ctx, ctx.update.message.body.text);
    });
}
