import sql from "@database/db_engine.ts";
import { ensureUser } from "./user-service.js";

export const DEFAULT_VOCABULARIES_WEIGHT = 0;
export const CORRECT_ANSWER_WEIGHT_DELTA = -3;
export const INCORRECT_ANSWER_WEIGHT_DELTA = 5;

export interface VocabularyWord {
    id: number;
    inputWord: string;
    answers: string[];
    weight: number;
}

export interface AnswerOptions {
    options: string[];
    correctIndex: number;
    correctAnswer: string;
}

export interface TrainingSession {
    id: string;
    words: VocabularyWord[];
    currentIndex: number;
    currentOptions: AnswerOptions | null;
    answered: number;
    correctAnswers: number;
    wrongWordIds: number[];
}

export interface TrainingResult {
    answered: number;
    correctAnswers: number;
    wrongWords: string[];
}

interface WeightRow {
    weight: number;
}

interface VocabularyRow {
    id: number;
    input_word: string;
    answers: string[];
    weight: number;
}

const sessions = new Map<number, TrainingSession>();
const activeAnswers = new Set<number>();
let sessionCounter = 0;

function shuffle<T>(items: T[]): T[] {
    const shuffled = [ ...items ];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [ shuffled[index], shuffled[randomIndex] ] = [ shuffled[randomIndex]!, shuffled[index]! ];
    }

    return shuffled;
}

async function ensureUserWeights(userId: number): Promise<void> {
    await ensureUser(userId);

    await sql`
        INSERT INTO vocabularies_wt (user_id, word_id, weight)
        SELECT ${userId}, v.id, ${DEFAULT_VOCABULARIES_WEIGHT}
        FROM vocabularies AS v
        ON CONFLICT (user_id, word_id) DO NOTHING
    `;
}

export function correctAnswerOf(word: VocabularyWord): string {
    return word.answers
        .map((answer) => answer.trim())
        .find((answer) => answer.length > 0) ?? "";
}

export function getAnswerOptions(word: VocabularyWord): AnswerOptions {
    const answers = word.answers
        .map((answer) => answer.trim())
        .filter((answer) => answer.length > 0);
    const correctAnswer = answers[0] ?? "";
    const options = shuffle(answers.length > 0 ? answers : [ correctAnswer ]);

    return {
        options,
        correctIndex: Math.max(0, options.indexOf(correctAnswer)),
        correctAnswer,
    };
}

export async function loadTrainingWords(userId: number): Promise<VocabularyWord[]> {
    await ensureUserWeights(userId);

    const rows = await sql<VocabularyRow[]>`
        SELECT
            v.id::int AS id,
            v.input_word AS input_word,
            v.answers AS answers,
            w.weight::int AS weight
        FROM vocabularies AS v
        INNER JOIN vocabularies_wt AS w
            ON w.word_id = v.id
            AND w.user_id = ${userId}
        ORDER BY w.weight DESC, random()
    `;

    return rows
        .map((row) => ({
            id: Number(row.id),
            inputWord: row.input_word.trim(),
            answers: Array.isArray(row.answers) ? row.answers.map(String) : [],
            weight: Number(row.weight),
        }))
        .filter((row) => row.inputWord.length > 0);
}

export async function loadDifficultWords(userId: number): Promise<VocabularyWord[]> {
    await ensureUserWeights(userId);

    const rows = await sql<VocabularyRow[]>`
        SELECT
            v.id::int AS id,
            v.input_word AS input_word,
            v.answers AS answers,
            w.weight::int AS weight
        FROM vocabularies AS v
        INNER JOIN vocabularies_wt AS w
            ON w.word_id = v.id
            AND w.user_id = ${userId}
        WHERE w.weight > 0
        ORDER BY w.weight DESC, random()
        LIMIT 10
    `;

    return rows.map((row) => ({
        id: Number(row.id),
        inputWord: row.input_word.trim(),
        answers: Array.isArray(row.answers) ? row.answers.map(String) : [],
        weight: Number(row.weight),
    }));
}

export async function updateWordWeight(
    userId: number,
    wordId: number,
    isCorrect: boolean,
): Promise<number | null> {
    const delta = isCorrect
        ? CORRECT_ANSWER_WEIGHT_DELTA
        : INCORRECT_ANSWER_WEIGHT_DELTA;
    const rows = await sql<WeightRow[]>`
        UPDATE vocabularies_wt
        SET weight = weight + ${delta}
        WHERE user_id = ${userId}
            AND word_id = ${wordId}
        RETURNING weight::int AS weight
    `;

    return rows[0]?.weight === undefined ? null : Number(rows[0].weight);
}

export function createTrainingSession(
    userId: number,
    words: VocabularyWord[],
): TrainingSession {
    sessionCounter += 1;
    const session: TrainingSession = {
        id: `${Date.now().toString(36)}-${sessionCounter.toString(36)}`,
        words: [ ...words ],
        currentIndex: 0,
        currentOptions: null,
        answered: 0,
        correctAnswers: 0,
        wrongWordIds: [],
    };
    sessions.set(userId, session);
    return session;
}

export function getTrainingSession(userId: number): TrainingSession | undefined {
    return sessions.get(userId);
}

export function clearTrainingSession(userId: number): void {
    sessions.delete(userId);
}

export function beginTrainingAnswer(userId: number): boolean {
    if (activeAnswers.has(userId)) {
        return false;
    }
    activeAnswers.add(userId);
    return true;
}

export function endTrainingAnswer(userId: number): void {
    activeAnswers.delete(userId);
}

export function recordTrainingAnswer(
    session: TrainingSession,
    wordId: number,
    isCorrect: boolean,
): void {
    session.answered += 1;
    if (isCorrect) {
        session.correctAnswers += 1;
    }
    else {
        session.wrongWordIds.push(wordId);
    }
}

export function finishTrainingSession(userId: number): TrainingResult | null {
    const session = sessions.get(userId);
    if (!session) {
        return null;
    }

    const wrongWords = session.wrongWordIds
        .map((wordId) => session.words.find((word) => word.id === wordId))
        .filter((word): word is VocabularyWord => word !== undefined)
        .map((word) => correctAnswerOf(word))
        .filter((word) => word.length > 0);
    const result: TrainingResult = {
        answered: session.answered,
        correctAnswers: session.correctAnswers,
        wrongWords,
    };
    sessions.delete(userId);
    return result;
}

export function currentTrainingWord(session: TrainingSession): VocabularyWord | undefined {
    return session.words[session.currentIndex];
}

export function setCurrentOptions(
    session: TrainingSession,
    word: VocabularyWord,
): AnswerOptions {
    const options = getAnswerOptions(word);
    session.currentOptions = options;
    return options;
}
