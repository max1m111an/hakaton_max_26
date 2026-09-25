import type { Bot, Context } from "@maxhub/max-bot-api";
import { Keyboard } from "@maxhub/max-bot-api";
import {
    CALLBACKS,
    ORTHOEPY_ANSWER_PATTERN,
    ORTHOEPY_FINISH_PATTERN,
} from "../constants/callbacks.js";
import {
    beginTrainingAnswer,
    clearTrainingSession,
    createTrainingSession,
    currentTrainingWord,
    endTrainingAnswer,
    finishTrainingSession,
    getStressOptions,
    getTrainingSession,
    loadDifficultWords,
    loadTrainingWords,
    recordTrainingAnswer,
    updateWordWeight,
} from "../orthoepy-service.js";
import {
    backToOrthoepyMenuKeyboard,
    orthoepyMenuKeyboard,
    trainingQuestionKeyboard,
} from "../keyboards/orthoepy.js";
import {
    ORTHOEPY_EMPTY_TEXT,
    ORTHOEPY_MENU_TEXT,
    orthoepyDifficultText,
    orthoepyFeedbackText,
    orthoepyQuestionText,
    trainingResultText,
} from "../texts/orthoepy.js";
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

export async function showOrthoepyMenu(ctx: Context): Promise<void> {
    await replaceMessage(ctx, ORTHOEPY_MENU_TEXT, orthoepyMenuKeyboard());
}

async function showTrainingQuestion(
    ctx: Context,
    session: ReturnType<typeof createTrainingSession>,
): Promise<void> {
    const word = currentTrainingWord(session);
    if (!word) {
        const result = finishTrainingSession(getUserId(ctx));
        if (result) {
            await replaceMessage(
                ctx,
                trainingResultText(result),
                backToOrthoepyMenuKeyboard(),
            );
        }
        return;
    }

    const stressOptions = getStressOptions(word.word);
    await replaceMessage(
        ctx,
        orthoepyQuestionText(word.word),
        trainingQuestionKeyboard(word.id, stressOptions.options, session.id),
    );
}

async function startTraining(ctx: Context, userId: number): Promise<void> {
    const words = await loadTrainingWords(userId);
    if (words.length === 0) {
        await replaceMessage(ctx, ORTHOEPY_EMPTY_TEXT, backToOrthoepyMenuKeyboard());
        return;
    }

    const session = createTrainingSession(userId, words);
    await showTrainingQuestion(ctx, session);
}

async function showDifficultWords(ctx: Context, userId: number): Promise<void> {
    const words = await loadDifficultWords(userId);
    await replaceMessage(
        ctx,
        orthoepyDifficultText(words),
        backToOrthoepyMenuKeyboard(),
    );
}

async function handleTrainingAnswer(ctx: Context): Promise<void> {
    const sessionId = ctx.match?.[1];
    const wordId = Number(ctx.match?.[2]);
    const optionIndex = Number(ctx.match?.[3]);
    if (!sessionId || !Number.isSafeInteger(wordId) || !Number.isSafeInteger(optionIndex)) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getTrainingSession(userId);
    const currentWord = session ? currentTrainingWord(session) : undefined;
    if (!session || session.id !== sessionId || !currentWord || currentWord.id !== wordId) {
        return;
    }

    const stressOptions = getStressOptions(currentWord.word);
    if (optionIndex < 0 || optionIndex >= stressOptions.options.length) {
        return;
    }
    if (!beginTrainingAnswer(userId)) {
        return;
    }

    try {
        const isCorrect = optionIndex === stressOptions.correctIndex;
        const updatedWeight = await updateWordWeight(userId, currentWord.id, isCorrect);
        if (updatedWeight === null) {
            throw new Error("The word weight was not found");
        }

        recordTrainingAnswer(session, currentWord.id, isCorrect);
        session.currentIndex += 1;
        const nextWord = currentTrainingWord(session);

        if (nextWord) {
            const nextStressOptions = getStressOptions(nextWord.word);
            await replaceMessage(
                ctx,
                orthoepyFeedbackText(
                    isCorrect,
                    stressOptions.correctWord,
                    nextWord.word,
                ),
                trainingQuestionKeyboard(
                    nextWord.id,
                    nextStressOptions.options,
                    session.id,
                ),
            );
            return;
        }

        const result = finishTrainingSession(userId);
        if (result) {
            await replaceMessage(
                ctx,
                trainingResultText(result),
                backToOrthoepyMenuKeyboard(),
            );
        }
    }
    catch {
        clearTrainingSession(userId);
        await replaceMessage(
            ctx,
            "Не удалось обновить статистику тренировки. Попробуй начать её ещё раз.",
            backToOrthoepyMenuKeyboard(),
        );
    }
    finally {
        endTrainingAnswer(userId);
    }
}

async function handleTrainingFinish(ctx: Context): Promise<void> {
    const sessionId = ctx.match?.[1];
    if (!sessionId) {
        return;
    }

    const userId = getUserId(ctx);
    const session = getTrainingSession(userId);
    if (!session || session.id !== sessionId) {
        return;
    }

    const result = finishTrainingSession(userId);
    if (result) {
        await replaceMessage(
            ctx,
            trainingResultText(result),
            backToOrthoepyMenuKeyboard(),
        );
    }
}

export function registerOrthoepy(bot: Bot): void {
    bot.action(CALLBACKS.ORTHOEPY_TRAIN, async (ctx) => {
        await startTraining(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.ORTHOEPY_DIFFICULT, async (ctx) => {
        await showDifficultWords(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.ORTHOEPY_BACK_TO_MAIN, async (ctx) => {
        await showMainMenu(ctx);
    });

    bot.action(CALLBACKS.ORTHOEPY_BACK_TO_MENU, async (ctx) => {
        await showOrthoepyMenu(ctx);
    });

    bot.action(ORTHOEPY_FINISH_PATTERN, async (ctx) => {
        await handleTrainingFinish(ctx);
    });

    bot.action(ORTHOEPY_ANSWER_PATTERN, async (ctx) => {
        await handleTrainingAnswer(ctx);
    });
}
