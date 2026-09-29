import type { Bot, Context } from "@maxhub/max-bot-api";
import { Keyboard } from "@maxhub/max-bot-api";
import {
    CALLBACKS,
    VOCABULARIES_ANSWER_PATTERN,
    VOCABULARIES_FINISH_PATTERN,
} from "../constants/callbacks.js";
import {
    beginTrainingAnswer,
    clearTrainingSession,
    createTrainingSession,
    currentTrainingWord,
    endTrainingAnswer,
    finishTrainingSession,
    getTrainingSession,
    loadDifficultWords,
    loadTrainingWords,
    recordTrainingAnswer,
    setCurrentOptions,
    updateWordWeight,
} from "../vocabularies-service.js";
import {
    backToVocabulariesMenuKeyboard,
    vocabulariesMenuKeyboard,
    vocabulariesQuestionKeyboard,
} from "../keyboards/vocabularies.js";
import {
    VOCABULARIES_EMPTY_TEXT,
    VOCABULARIES_MENU_TEXT,
    vocabulariesDifficultText,
    vocabulariesFeedbackText,
    vocabulariesQuestionText,
    vocabulariesResultText,
} from "../texts/vocabularies.js";
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

export async function showVocabulariesMenu(ctx: Context): Promise<void> {
    await replaceMessage(ctx, VOCABULARIES_MENU_TEXT, vocabulariesMenuKeyboard());
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
                vocabulariesResultText(result),
                backToVocabulariesMenuKeyboard(),
            );
        }
        return;
    }

    const answerOptions = setCurrentOptions(session, word);
    await replaceMessage(
        ctx,
        vocabulariesQuestionText(word.inputWord),
        vocabulariesQuestionKeyboard(word.id, answerOptions.options, session.id),
    );
}

async function startTraining(ctx: Context, userId: number): Promise<void> {
    const words = await loadTrainingWords(userId);
    if (words.length === 0) {
        await replaceMessage(ctx, VOCABULARIES_EMPTY_TEXT, backToVocabulariesMenuKeyboard());
        return;
    }

    const session = createTrainingSession(userId, words);
    await showTrainingQuestion(ctx, session);
}

async function showDifficultWords(ctx: Context, userId: number): Promise<void> {
    const words = await loadDifficultWords(userId);
    await replaceMessage(
        ctx,
        vocabulariesDifficultText(words),
        backToVocabulariesMenuKeyboard(),
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

    const answerOptions = session.currentOptions;
    if (!answerOptions || optionIndex < 0 || optionIndex >= answerOptions.options.length) {
        return;
    }
    if (!beginTrainingAnswer(userId)) {
        return;
    }

    try {
        const isCorrect = optionIndex === answerOptions.correctIndex;
        const updatedWeight = await updateWordWeight(userId, currentWord.id, isCorrect);
        if (updatedWeight === null) {
            throw new Error("The word weight was not found");
        }

        recordTrainingAnswer(session, currentWord.id, isCorrect);
        session.currentIndex += 1;
        const nextWord = currentTrainingWord(session);

        if (nextWord) {
            const nextAnswerOptions = setCurrentOptions(session, nextWord);
            await replaceMessage(
                ctx,
                vocabulariesFeedbackText(
                    isCorrect,
                    answerOptions.correctAnswer,
                    nextWord.inputWord,
                ),
                vocabulariesQuestionKeyboard(
                    nextWord.id,
                    nextAnswerOptions.options,
                    session.id,
                ),
            );
            return;
        }

        const result = finishTrainingSession(userId);
        if (result) {
            await replaceMessage(
                ctx,
                vocabulariesResultText(result),
                backToVocabulariesMenuKeyboard(),
            );
        }
    }
    catch {
        clearTrainingSession(userId);
        await replaceMessage(
            ctx,
            "Не удалось обновить статистику тренировки. Попробуй начать её ещё раз.",
            backToVocabulariesMenuKeyboard(),
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
            vocabulariesResultText(result),
            backToVocabulariesMenuKeyboard(),
        );
    }
}

export function registerVocabularies(bot: Bot): void {
    bot.action(CALLBACKS.VOCABULARIES_TRAIN, async (ctx) => {
        await startTraining(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.VOCABULARIES_DIFFICULT, async (ctx) => {
        await showDifficultWords(ctx, getUserId(ctx));
    });

    bot.action(CALLBACKS.VOCABULARIES_BACK_TO_MAIN, async (ctx) => {
        await showMainMenu(ctx);
    });

    bot.action(CALLBACKS.VOCABULARIES_BACK_TO_MENU, async (ctx) => {
        await showVocabulariesMenu(ctx);
    });

    bot.action(VOCABULARIES_FINISH_PATTERN, async (ctx) => {
        await handleTrainingFinish(ctx);
    });

    bot.action(VOCABULARIES_ANSWER_PATTERN, async (ctx) => {
        await handleTrainingAnswer(ctx);
    });
}
