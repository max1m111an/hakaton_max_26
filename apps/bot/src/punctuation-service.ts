import sql from "@database/db_engine.ts";
import { ensureUser } from "@bot/user-service.js";

export const DEFAULT_RULE_WEIGHT = 0;
export const CORRECT_POSITION_WEIGHT_DELTA = 5;
export const INCORRECT_POSITION_WEIGHT_DELTA = -3;

export interface PunctuationRule {
    id: number;
    ruleText: string;
    weight: number;
}

export interface PunctuationTask {
    id: number;
    maskedText: string;
    correctAnswers: number[];
    explanations: Record<string, number>;
}

export interface PositionVerdict {
    position: number;
    ruleId: number;
    ruleText: string;
    commaNeeded: boolean;
    isCorrect: boolean;
}

export interface TaskEvaluation {
    isFullyCorrect: boolean;
    verdicts: PositionVerdict[];
}

export interface PunctuationSession {
    id: string;
    task: PunctuationTask;
    evaluation: TaskEvaluation | null;
    answered: number;
    fullyCorrect: number;
    wrongRuleIds: number[];
}

export interface PunctuationResult {
    answered: number;
    fullyCorrect: number;
    wrongRules: string[];
}

interface TaskRow {
    id: number;
    masked_text: string;
    correct_answers: number[];
    explanations: Record<string, number> | string;
}

interface RuleRow {
    id: number;
    rule_text: string;
    weight: number;
}

const sessions = new Map<number, PunctuationSession>();
let sessionCounter = 0;

function normalizeExplanations(value: Record<string, number> | string): Record<string, number> {
    if (typeof value === "string") {
        try {
            return normalizeExplanations(JSON.parse(value) as Record<string, number>);
        }
        catch {
            return {};
        }
    }

    const normalized: Record<string, number> = {};
    for (const [ position, ruleId ] of Object.entries(value ?? {})) {
        const parsedPosition = Number(position);
        const parsedRuleId = Number(ruleId);
        if (Number.isFinite(parsedPosition) && Number.isFinite(parsedRuleId)) {
            normalized[String(parsedPosition)] = parsedRuleId;
        }
    }

    return normalized;
}

function mapTask(row: TaskRow): PunctuationTask {
    return {
        id: Number(row.id),
        maskedText: row.masked_text,
        correctAnswers: Array.isArray(row.correct_answers) ? row.correct_answers.map(Number) : [],
        explanations: normalizeExplanations(row.explanations),
    };
}

export function positionsOf(task: PunctuationTask): number[] {
    return Object.keys(task.explanations)
        .map((position) => Number(position))
        .sort((left, right) => left - right);
}

export function parsePositions(input: string): number[] | null {
    const digits = input.trim();
    if (!/^\d+$/.test(digits)) {
        return null;
    }

    return [ ...new Set(Array.from(digits, (digit) => Number(digit))) ]
        .sort((left, right) => left - right);
}

export function buildPunctuatedText(maskedText: string, correctAnswers: number[]): string {
    const expected = new Set(correctAnswers);

    return maskedText
        .replace(/\((\d+)\)/g, (_match, position: string) => expected.has(Number(position)) ? "," : "")
        .replace(/\s+,/g, ",")
        .replace(/,(?=\S)/g, ", ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

async function ensureUserRuleWeights(userId: number): Promise<void> {
    await ensureUser(userId);

    await sql`
        INSERT INTO user_rule_weights (user_id, rule_id, weight)
        SELECT ${userId}, r.id, ${DEFAULT_RULE_WEIGHT}
        FROM punctuation_rules AS r
        ON CONFLICT (user_id, rule_id) DO NOTHING
    `;
}

export async function hasAnyRule(): Promise<boolean> {
    const rows = await sql<{ exists: boolean }[]>`
        SELECT EXISTS (SELECT 1 FROM punctuation_rules) AS exists
    `;

    return rows[0]?.exists === true;
}

export async function loadDifficultRules(userId: number): Promise<PunctuationRule[]> {
    await ensureUserRuleWeights(userId);

    const rows = await sql<RuleRow[]>`
        SELECT
            r.id::int AS id,
            r.rule_text AS rule_text,
            w.weight::int AS weight
        FROM punctuation_rules AS r
        INNER JOIN user_rule_weights AS w
            ON w.rule_id = r.id
            AND w.user_id = ${userId}
        WHERE w.weight > 0
        ORDER BY w.weight DESC, random()
        LIMIT 10
    `;

    return rows.map((row) => ({
        id: Number(row.id),
        ruleText: row.rule_text,
        weight: Number(row.weight),
    }));
}

async function loadTopRule(userId: number): Promise<PunctuationRule | undefined> {
    await ensureUserRuleWeights(userId);

    const rows = await sql<RuleRow[]>`
        SELECT
            r.id::int AS id,
            r.rule_text AS rule_text,
            w.weight::int AS weight
        FROM punctuation_rules AS r
        INNER JOIN user_rule_weights AS w
            ON w.rule_id = r.id
            AND w.user_id = ${userId}
        ORDER BY w.weight DESC, random()
        LIMIT 1
    `;

    const row = rows[0];
    if (row === undefined) {
        return undefined;
    }

    return { id: Number(row.id), ruleText: row.rule_text, weight: Number(row.weight) };
}

export async function pickNextTask(
    userId: number,
    excludeTaskId?: number,
): Promise<PunctuationTask | null> {
    const topRule = await loadTopRule(userId);
    if (!topRule) {
        return null;
    }

    const withRule = await sql<TaskRow[]>`
        SELECT
            t.id::int AS id,
            t.masked_text AS masked_text,
            t.correct_answers AS correct_answers,
            t.explanations AS explanations
        FROM punctuation_tasks AS t
        WHERE EXISTS (
            SELECT 1
            FROM jsonb_each(t.explanations) AS entry
            WHERE entry.value::TEXT = ${topRule.id}::TEXT
        )
            AND (${excludeTaskId ?? null}::BIGINT IS NULL OR t.id <> ${excludeTaskId ?? null}::BIGINT)
        ORDER BY random()
        LIMIT 1
    `;

    const preferred = withRule[0];
    if (preferred) {
        return mapTask(preferred);
    }

    const fallback = await sql<TaskRow[]>`
        SELECT
            t.id::int AS id,
            t.masked_text AS masked_text,
            t.correct_answers AS correct_answers,
            t.explanations AS explanations
        FROM punctuation_tasks AS t
        WHERE (${excludeTaskId ?? null}::BIGINT IS NULL OR t.id <> ${excludeTaskId ?? null}::BIGINT)
        ORDER BY random()
        LIMIT 1
    `;

    const row = fallback[0];
    return row === undefined ? null : mapTask(row);
}

export async function loadRuleTexts(ruleIds: number[]): Promise<Map<number, string>> {
    if (ruleIds.length === 0) {
        return new Map();
    }

    const rows = await sql<RuleRow[]>`
        SELECT id::int AS id, rule_text AS rule_text, 0::int AS weight
        FROM punctuation_rules
        WHERE id = ANY(${ruleIds})
    `;

    return new Map(rows.map((row) => [ Number(row.id), row.rule_text ]));
}

export async function evaluateTask(
    task: PunctuationTask,
    positions: number[],
): Promise<TaskEvaluation> {
    const ruleTexts = await loadRuleTexts(
        Object.values(task.explanations).map((ruleId) => Number(ruleId)),
    );
    const given = new Set(positions);
    const expected = new Set(task.correctAnswers);

    const verdicts: PositionVerdict[] = positionsOf(task).map((position) => {
        const ruleId = Number(task.explanations[String(position)]);
        const commaNeeded = expected.has(position);

        return {
            position,
            ruleId,
            ruleText: ruleTexts.get(ruleId) ?? "",
            commaNeeded,
            isCorrect: given.has(position) === commaNeeded,
        };
    });

    const isFullyCorrect = given.size === expected.size
        && [ ...expected ].every((position) => given.has(position));

    return { isFullyCorrect, verdicts };
}

export async function applyVerdictWeights(
    userId: number,
    evaluation: TaskEvaluation,
): Promise<void> {
    await ensureUserRuleWeights(userId);

    for (const verdict of evaluation.verdicts) {
        const delta = verdict.isCorrect
            ? CORRECT_POSITION_WEIGHT_DELTA
            : INCORRECT_POSITION_WEIGHT_DELTA;

        await sql`
            UPDATE user_rule_weights
            SET weight = weight + ${delta}
            WHERE user_id = ${userId}
                AND rule_id = ${verdict.ruleId}
        `;
    }
}

export function createSession(userId: number, task: PunctuationTask): PunctuationSession {
    sessionCounter += 1;
    const session: PunctuationSession = {
        id: `${Date.now().toString(36)}-${sessionCounter.toString(36)}`,
        task,
        evaluation: null,
        answered: 0,
        fullyCorrect: 0,
        wrongRuleIds: [],
    };
    sessions.set(userId, session);
    return session;
}

export function getSession(userId: number): PunctuationSession | undefined {
    return sessions.get(userId);
}

export function advanceTask(userId: number, task: PunctuationTask): PunctuationSession {
    const session = sessions.get(userId);
    if (!session) {
        return createSession(userId, task);
    }

    session.task = task;
    session.evaluation = null;
    sessions.set(userId, session);
    return session;
}

export function clearSession(userId: number): void {
    sessions.delete(userId);
}

export function recordAnswer(
    session: PunctuationSession,
    evaluation: TaskEvaluation,
): void {
    session.answered += 1;
    session.evaluation = evaluation;

    if (evaluation.isFullyCorrect) {
        session.fullyCorrect += 1;
        return;
    }

    for (const verdict of evaluation.verdicts) {
        if (!verdict.isCorrect && !session.wrongRuleIds.includes(verdict.ruleId)) {
            session.wrongRuleIds.push(verdict.ruleId);
        }
    }
}

export async function finishSession(userId: number): Promise<PunctuationResult | null> {
    const session = sessions.get(userId);
    if (!session) {
        return null;
    }

    const ruleTexts = await loadRuleTexts(session.wrongRuleIds);
    const result: PunctuationResult = {
        answered: session.answered,
        fullyCorrect: session.fullyCorrect,
        wrongRules: session.wrongRuleIds
            .map((ruleId) => ruleTexts.get(ruleId))
            .filter((ruleText): ruleText is string => ruleText !== undefined),
    };

    sessions.delete(userId);
    return result;
}
