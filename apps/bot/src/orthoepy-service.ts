import sql from "@database/db_engine.ts";

export const DEFAULT_ORTHOEPY_WEIGHT = 0;
export const CORRECT_ANSWER_WEIGHT_DELTA = -3;
export const INCORRECT_ANSWER_WEIGHT_DELTA = 5;

export interface TrainingWord {
    id: number;
    word: string;
    weight: number;
}

export interface StressOptions {
    options: string[];
    correctIndex: number;
    correctWord: string;
}

export interface TrainingSession {
    id: string;
    words: TrainingWord[];
    currentIndex: number;
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

const vowelSet = new Set([ ... "аеёиоуыэюя" ]);
const sessions = new Map<number, TrainingSession>();
const activeAnswers = new Set<number>();
let sessionCounter = 0;

function isVowel(character: string): boolean {
    return vowelSet.has(character.toLowerCase());
}

function isUppercase(character: string): boolean {
    return character !== character.toLowerCase() && character === character.toUpperCase();
}

function markStress(characters: string[], stressIndex: number): string {
    return characters
        .map((character, index) => index === stressIndex
            ? character.toUpperCase()
            : character.toLowerCase())
        .join("");
}

export function getStressOptions(word: string): StressOptions {
    const characters = Array.from(word.trim());
    if (characters.length === 0) {
        return {
            options: [ "" ],
            correctIndex: 0,
            correctWord: "",
        };
    }

    const vowelIndices = characters.flatMap((character, index) => isVowel(character) ? [ index ] : []);
    const optionIndices = vowelIndices.length > 0 ? vowelIndices : [ 0 ];
    const uppercaseVowelIndices = vowelIndices.filter((index) => isUppercase(characters[index] ?? ""));
    const explicitStressIndex = uppercaseVowelIndices.find((index) => index !== 0)
        ?? uppercaseVowelIndices[0];
    const correctIndex = explicitStressIndex === undefined
        ? 0
        : Math.max(0, vowelIndices.indexOf(explicitStressIndex));
    const options = optionIndices.map((index) => markStress(characters, index));

    return {
        options,
        correctIndex,
        correctWord: options[correctIndex] ?? options[0] ?? "",
    };
}

export async function ensureUser(userId: number): Promise<void> {
    await sql`
        INSERT INTO users (id)
        VALUES (${userId})
        ON CONFLICT (id) DO NOTHING
    `;

    await sql`
        INSERT INTO orthoepy_wt (user_id, word_id, weight)
        SELECT ${userId}, o.id, ${DEFAULT_ORTHOEPY_WEIGHT}
        FROM orthoepy AS o
        ON CONFLICT (user_id, word_id) DO NOTHING
    `;
}

export async function loadTrainingWords(userId: number): Promise<TrainingWord[]> {
    await ensureUser(userId);

    const rows = await sql<TrainingWord[]>`
        SELECT
            o.id::int AS id,
            o.word AS word,
            w.weight::int AS weight
        FROM orthoepy AS o
        INNER JOIN orthoepy_wt AS w
            ON w.word_id = o.id
            AND w.user_id = ${userId}
        ORDER BY w.weight DESC, random()
    `;

    return rows
        .map((row) => ({
            id: Number(row.id),
            word: row.word.trim(),
            weight: Number(row.weight),
        }))
        .filter((row) => row.word.length > 0);
}

export async function loadDifficultWords(userId: number): Promise<TrainingWord[]> {
    await ensureUser(userId);

    const rows = await sql<TrainingWord[]>`
        SELECT
            o.id::int AS id,
            o.word AS word,
            w.weight::int AS weight
        FROM orthoepy AS o
        INNER JOIN orthoepy_wt AS w
            ON w.word_id = o.id
            AND w.user_id = ${userId}
        WHERE w.weight > 0
        ORDER BY w.weight DESC, random()
        LIMIT 10
    `;

    return rows.map((row) => ({
        id: Number(row.id),
        word: row.word,
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
        UPDATE orthoepy_wt
        SET weight = weight + ${delta}
        WHERE user_id = ${userId}
            AND word_id = ${wordId}
        RETURNING weight::int AS weight
    `;

    return rows[0]?.weight === undefined ? null : Number(rows[0].weight);
}

export function createTrainingSession(
    userId: number,
    words: TrainingWord[],
): TrainingSession {
    sessionCounter += 1;
    const session: TrainingSession = {
        id: `${Date.now().toString(36)}-${sessionCounter.toString(36)}`,
        words: [ ...words ],
        currentIndex: 0,
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
        .map((wordId) => session.words.find((word) => word.id === wordId)?.word)
        .filter((word): word is string => word !== undefined);
    const result: TrainingResult = {
        answered: session.answered,
        correctAnswers: session.correctAnswers,
        wrongWords,
    };
    sessions.delete(userId);
    return result;
}

export function currentTrainingWord(session: TrainingSession): TrainingWord | undefined {
    return session.words[session.currentIndex];
}
