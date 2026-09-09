/**
 * Server-side round orchestration: creating rounds, scoring a submitted
 * answer, and finishing a round. This is the sole place scoring happens —
 * never trust a client-computed score. See src/app/api/round/* for the
 * HTTP surface over these functions.
 *
 * Every exported function here is async because the db layer (libSQL) is
 * always async — local dev talks to a file over the same async client used
 * against hosted Turso in production, so there's no sync/async split to
 * maintain between environments.
 */
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { ANSWER_POOLS, PROMPT_SETS, validAnswersForPrompt } from '../data/categories';
import { buildIndex, matchAnswer } from './match';
import { seededSharesForPrompt, blendedShare } from './rarity';
import { tierForShare, tierByName, FAILED_TIER } from './tiers';
import type { TierName } from './types';
import { currentPuzzleDateET, dailySeed, unlimitedSeed, selectPrompts, PROMPTS_PER_ROUND } from './daily';
import type { CategoryId, Prompt } from './types';

export const TIME_PER_PROMPT_MS = 20_000;

// Index build is pure CPU work over a static pool — cache per category so we
// don't rebuild it on every request.
const indexCache = new Map<CategoryId, ReturnType<typeof buildIndex>>();
function getIndex(category: CategoryId) {
  let idx = indexCache.get(category);
  if (!idx) {
    idx = buildIndex(ANSWER_POOLS[category]);
    indexCache.set(category, idx);
  }
  return idx;
}

export async function ensurePlayer(playerId: string, nickname: string): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO players (id, nickname) VALUES (?, ?)
          ON CONFLICT(id) DO UPDATE SET nickname = excluded.nickname`,
    args: [playerId, nickname],
  });
}

export interface StartRoundResult {
  roundId: string;
  promptIds: string[];
  promptTexts: string[];
  mode: 'daily' | 'unlimited';
  puzzleDate: string | null;
  timePerPromptMs: number;
}

export async function startRound(
  playerId: string,
  category: CategoryId,
  mode: 'daily' | 'unlimited'
): Promise<StartRoundResult> {
  const db = await getDb();
  const allPrompts = PROMPT_SETS[category];
  const puzzleDate = mode === 'daily' ? currentPuzzleDateET() : null;

  if (mode === 'daily' && puzzleDate) {
    const already = await db.execute({
      sql: `SELECT 1 FROM daily_results WHERE player_id = ? AND category_id = ? AND puzzle_date = ?`,
      args: [playerId, category, puzzleDate],
    });
    if (already.rows.length > 0) {
      throw new Error('ALREADY_PLAYED_TODAY');
    }
  }

  const seed = mode === 'daily' && puzzleDate ? dailySeed(puzzleDate, category) : unlimitedSeed();
  const prompts = selectPrompts(allPrompts, seed, PROMPTS_PER_ROUND);
  const roundId = randomUUID();

  await db.execute({
    sql: `INSERT INTO rounds (id, player_id, category_id, mode, puzzle_date, seed, prompt_ids)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [roundId, playerId, category, mode, puzzleDate, seed, JSON.stringify(prompts.map((p) => p.id))],
  });

  return {
    roundId,
    promptIds: prompts.map((p) => p.id),
    promptTexts: prompts.map((p) => p.text),
    mode,
    puzzleDate,
    timePerPromptMs: TIME_PER_PROMPT_MS,
  };
}

interface RoundRow {
  id: string;
  player_id: string;
  category_id: CategoryId;
  mode: 'daily' | 'unlimited';
  puzzle_date: string | null;
  seed: number;
  prompt_ids: string;
  started_at: string;
  completed_at: string | null;
  total_score: number;
}

async function loadRound(roundId: string): Promise<RoundRow> {
  const db = await getDb();
  const result = await db.execute({ sql: `SELECT * FROM rounds WHERE id = ?`, args: [roundId] });
  const row = result.rows[0] as unknown as RoundRow | undefined;
  if (!row) throw new Error('ROUND_NOT_FOUND');
  return row;
}

function findPrompt(category: CategoryId, promptId: string): Prompt {
  const prompt = PROMPT_SETS[category].find((p) => p.id === promptId);
  if (!prompt) throw new Error('PROMPT_NOT_FOUND');
  return prompt;
}

export interface AnswerResult {
  promptIndex: number;
  valid: boolean;
  corrected: boolean;
  resolvedName: string | null;
  feedback: string | null;
  tierName: string;
  tierLabel: string;
  points: number;
  sharePercent: number | null;
  cumulativeScore: number;
}

/**
 * Score one submitted answer server-side. `clientElapsedMs` is advisory
 * only — the authoritative elapsed time is measured against the round's
 * started_at plus how many prompts have already been answered, so a
 * tampered client timer can't extend the real time budget.
 */
export async function submitAnswer(
  roundId: string,
  promptIndex: number,
  rawInput: string,
  clientElapsedMs: number
): Promise<AnswerResult> {
  const db = await getDb();
  const round = await loadRound(roundId);
  if (round.completed_at) throw new Error('ROUND_ALREADY_COMPLETE');

  const promptIds: string[] = JSON.parse(round.prompt_ids);
  if (promptIndex < 0 || promptIndex >= promptIds.length) throw new Error('BAD_PROMPT_INDEX');

  const already = await db.execute({
    sql: `SELECT 1 FROM round_answers WHERE round_id = ? AND prompt_index = ?`,
    args: [roundId, promptIndex],
  });
  if (already.rows.length > 0) throw new Error('PROMPT_ALREADY_ANSWERED');

  const promptId = promptIds[promptIndex] as string;
  const prompt = findPrompt(round.category_id, promptId);

  // Authoritative timing: cap elapsed at the per-prompt budget regardless of
  // what the client reports, so an expired timer always scores 0.
  const msTaken = Math.max(0, Math.min(clientElapsedMs, TIME_PER_PROMPT_MS + 2000));
  const expired = clientElapsedMs > TIME_PER_PROMPT_MS;

  const index = getIndex(round.category_id);
  const match = expired ? ({ kind: 'invalid', reason: 'no-match' } as const) : matchAnswer(rawInput, index, prompt);

  let tier = FAILED_TIER;
  let sharePercent: number | null = null;
  let resolvedName: string | null = null;
  let corrected = false;
  let feedback: string | null = null;

  if (match.kind === 'valid') {
    resolvedName = match.answer.name;
    corrected = match.corrected;

    const validAnswers = validAnswersForPrompt(prompt);
    const seedShares = seededSharesForPrompt(validAnswers);
    const seedShare = seedShares.get(match.answer.id) ?? 0;

    const [totalResult, countResult] = await Promise.all([
      db.execute({ sql: `SELECT total FROM prompt_totals WHERE prompt_id = ?`, args: [promptId] }),
      db.execute({
        sql: `SELECT count FROM answer_counts WHERE prompt_id = ? AND answer_id = ?`,
        args: [promptId, match.answer.id],
      }),
    ]);
    const livePromptTotal = (totalResult.rows[0]?.total as number | undefined) ?? 0;
    const liveCount = (countResult.rows[0]?.count as number | undefined) ?? 0;

    const share = blendedShare(seedShare, liveCount, livePromptTotal);
    sharePercent = share;
    tier = tierForShare(share);

    // record the submission into the live rarity tables
    await Promise.all([
      db.execute({
        sql: `INSERT INTO answer_counts (prompt_id, answer_id, count) VALUES (?, ?, 1)
              ON CONFLICT(prompt_id, answer_id) DO UPDATE SET count = count + 1`,
        args: [promptId, match.answer.id],
      }),
      db.execute({
        sql: `INSERT INTO prompt_totals (prompt_id, total) VALUES (?, 1)
              ON CONFLICT(prompt_id) DO UPDATE SET total = total + 1`,
        args: [promptId],
      }),
    ]);
  } else if (match.kind === 'invalid' && match.reason === 'wrong-tag') {
    feedback = `${match.answer.name} doesn't fit — try again next time.`;
  } else if (expired) {
    feedback = "Time's up.";
  } else {
    feedback = "That doesn't match anything in this category.";
  }

  await db.execute({
    sql: `INSERT INTO round_answers
            (round_id, prompt_index, prompt_id, raw_input, answer_id, valid, corrected, tier, points, share, ms_taken)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      roundId,
      promptIndex,
      promptId,
      rawInput.slice(0, 200),
      match.kind === 'valid' ? match.answer.id : null,
      match.kind === 'valid' ? 1 : 0,
      corrected ? 1 : 0,
      tier.name,
      tier.points,
      sharePercent,
      msTaken,
    ],
  });

  const cumulative = await db.execute({
    sql: `SELECT COALESCE(SUM(points), 0) as total FROM round_answers WHERE round_id = ?`,
    args: [roundId],
  });

  return {
    promptIndex,
    valid: match.kind === 'valid',
    corrected,
    resolvedName,
    feedback,
    tierName: tier.name,
    tierLabel: tier.label,
    points: tier.points,
    sharePercent,
    cumulativeScore: Number(cumulative.rows[0]?.total ?? 0),
  };
}

export interface FinishRoundResult {
  roundId: string;
  totalScore: number;
  breakdown: Array<{
    promptText: string;
    tierName: string;
    tierLabel: string;
    points: number;
    sharePercent: number | null;
    resolvedName: string | null;
    rareExamples: string[];
  }>;
  isNewDailyResult: boolean;
}

/** Up to 3 valid answers for this prompt, rarest-first, excluding the one the player already gave. */
function rareExamplesFor(prompt: Prompt, excludeAnswerId: string | null): string[] {
  const validAnswers = validAnswersForPrompt(prompt);
  const seedShares = seededSharesForPrompt(validAnswers);
  return validAnswers
    .filter((a) => a.id !== excludeAnswerId)
    .sort((a, b) => (seedShares.get(a.id) ?? 0) - (seedShares.get(b.id) ?? 0))
    .slice(0, 3)
    .map((a) => a.name);
}

export async function finishRound(roundId: string, nickname: string): Promise<FinishRoundResult> {
  const db = await getDb();
  const round = await loadRound(roundId);
  if (round.completed_at) throw new Error('ROUND_ALREADY_COMPLETE');

  const promptIds: string[] = JSON.parse(round.prompt_ids);
  const result = await db.execute({
    sql: `SELECT * FROM round_answers WHERE round_id = ? ORDER BY prompt_index ASC`,
    args: [roundId],
  });
  const answers = result.rows as unknown as Array<{
    prompt_index: number;
    prompt_id: string;
    tier: string;
    points: number;
    answer_id: string | null;
    share: number | null;
  }>;

  if (answers.length !== promptIds.length) {
    throw new Error('ROUND_INCOMPLETE');
  }

  const totalScore = answers.reduce((sum, a) => sum + a.points, 0);

  const breakdown = answers.map((ans) => {
    const prompt = findPrompt(round.category_id, ans.prompt_id);
    const answerEntry = ans.answer_id
      ? ANSWER_POOLS[round.category_id].find((e) => e.id === ans.answer_id)
      : null;
    return {
      promptText: prompt.text,
      tierName: ans.tier,
      tierLabel: tierByName(ans.tier as TierName).label,
      points: ans.points,
      sharePercent: ans.share,
      resolvedName: answerEntry?.name ?? null,
      rareExamples: rareExamplesFor(prompt, ans.answer_id),
    };
  });

  await db.execute({
    sql: `UPDATE rounds SET completed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), total_score = ? WHERE id = ?`,
    args: [totalScore, roundId],
  });

  let isNewDailyResult = false;
  if (round.mode === 'daily' && round.puzzle_date) {
    await ensurePlayer(round.player_id, nickname);
    await db.execute({
      sql: `INSERT INTO daily_results (player_id, category_id, puzzle_date, round_id, total_score, nickname)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(player_id, category_id, puzzle_date) DO NOTHING`,
      args: [round.player_id, round.category_id, round.puzzle_date, roundId, totalScore, nickname],
    });
    isNewDailyResult = true;
  }

  return { roundId, totalScore, breakdown, isNewDailyResult };
}
