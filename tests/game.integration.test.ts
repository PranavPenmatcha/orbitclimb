import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// db.ts reads ORBIT_DB_PATH at module-load time, so it must be set before
// any of these modules are imported. Using a fresh temp file per test run
// keeps this isolated from the real orbit.db and from other test files.
const tmpDb = path.join(os.tmpdir(), `orbit-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.ORBIT_DB_PATH = tmpDb;

let startRound: typeof import('@/lib/game').startRound;
let submitAnswer: typeof import('@/lib/game').submitAnswer;
let finishRound: typeof import('@/lib/game').finishRound;
let ensurePlayer: typeof import('@/lib/game').ensurePlayer;
let getDb: typeof import('@/lib/db').getDb;

beforeAll(async () => {
  const game = await import('@/lib/game');
  const db = await import('@/lib/db');
  startRound = game.startRound;
  submitAnswer = game.submitAnswer;
  finishRound = game.finishRound;
  ensurePlayer = game.ensurePlayer;
  getDb = db.getDb;
});

afterAll(() => {
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      fs.unlinkSync(tmpDb + suffix);
    } catch {
      /* ignore */
    }
  }
});

describe('full round flow against a real libSQL db', () => {
  it('scores a valid answer, an invalid answer, and completes a round', async () => {
    const playerId = 'test-player-1';
    await ensurePlayer(playerId, 'Tester');

    const round = await startRound(playerId, 'animals', 'unlimited');
    expect(round.promptIds).toHaveLength(7);

    // answer prompt 0 with obvious nonsense -> invalid, 0 points
    const bad = await submitAnswer(round.roundId, 0, 'zzzznotarealanimalzzzz', 5000);
    expect(bad.valid).toBe(false);
    expect(bad.points).toBe(0);

    // answer remaining prompts with something that at least might match;
    // since prompts are randomized we just verify the pipeline doesn't throw
    // and produces a cumulative score.
    for (let i = 1; i < 7; i++) {
      const res = await submitAnswer(round.roundId, i, 'asdkfjasldkfj', 5000);
      expect(res.valid).toBe(false);
      expect(res.cumulativeScore).toBeGreaterThanOrEqual(0);
    }

    const finished = await finishRound(round.roundId, 'Tester');
    expect(finished.totalScore).toBe(0); // all 7 were nonsense
    expect(finished.breakdown).toHaveLength(7);
  });

  it('rejects answering the same prompt index twice', async () => {
    const playerId = 'test-player-2';
    await ensurePlayer(playerId, 'Tester2');
    const round = await startRound(playerId, 'animals', 'unlimited');
    await submitAnswer(round.roundId, 0, 'dolphin', 5000);
    await expect(submitAnswer(round.roundId, 0, 'dolphin', 5000)).rejects.toThrow();
  });

  it('rejects an expired timer even with a valid answer', async () => {
    const playerId = 'test-player-3';
    await ensurePlayer(playerId, 'Tester3');
    const round = await startRound(playerId, 'animals', 'unlimited');
    const result = await submitAnswer(round.roundId, 0, 'Lion', 25000); // over the 20s budget
    expect(result.valid).toBe(false);
  });

  it('degrades tier as live submissions for the same answer accumulate (proves blending is wired up)', async () => {
    const category = 'animals' as const;

    // Drive many rounds all answering "Dolphin" for the ocean prompt
    // specifically, so its live share climbs and its tier gets worse.
    const promptId = 'animals.ocean';
    const results: number[] = [];

    for (let i = 0; i < 60; i++) {
      const playerId = `blend-player-${i}`;
      await ensurePlayer(playerId, `Blend${i}`);
      const round = await startRound(playerId, category, 'unlimited');
      const idx = round.promptIds.indexOf(promptId);
      if (idx === -1) continue; // this random round didn't include our target prompt, skip
      const res = await submitAnswer(round.roundId, idx, 'Dolphin', 5000);
      if (res.valid) results.push(res.points);
    }

    expect(results.length).toBeGreaterThan(5);
    // later submissions should score no better than earlier ones as the
    // live count pushes dolphin's share up (tier is monotonic in share)
    const first = results[0] as number;
    const last = results[results.length - 1] as number;
    expect(last).toBeLessThanOrEqual(first);

    // and the raw counter really did increment in the db
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT count FROM answer_counts WHERE prompt_id = ? AND answer_id = 'dolphin'`,
      args: [promptId],
    });
    const row = result.rows[0] as unknown as { count: number } | undefined;
    expect(row?.count).toBeGreaterThan(0);
  });

  it("includes rare-answer examples in the finish breakdown, excluding the player's own pick", async () => {
    const playerId = 'test-player-reveal';
    await ensurePlayer(playerId, 'RevealTester');
    const round = await startRound(playerId, 'animals', 'unlimited');
    for (let i = 0; i < 7; i++) {
      await submitAnswer(round.roundId, i, 'Dog', 5000); // a common, valid-ish answer for many animal prompts
    }
    const finished = await finishRound(round.roundId, 'RevealTester');
    expect(finished.breakdown).toHaveLength(7);
    for (const entry of finished.breakdown) {
      expect(Array.isArray(entry.rareExamples)).toBe(true);
      expect(entry.rareExamples.length).toBeLessThanOrEqual(3);
      // the reveal should never just repeat back the player's own resolved answer
      if (entry.resolvedName) {
        expect(entry.rareExamples).not.toContain(entry.resolvedName);
      }
    }
  });

  it('blocks replaying a completed daily puzzle', async () => {
    const playerId = 'test-player-daily';
    await ensurePlayer(playerId, 'DailyTester');
    const round = await startRound(playerId, 'movies', 'daily');
    for (let i = 0; i < 7; i++) {
      await submitAnswer(round.roundId, i, 'nonsense', 5000);
    }
    await finishRound(round.roundId, 'DailyTester');
    await expect(startRound(playerId, 'movies', 'daily')).rejects.toThrow('ALREADY_PLAYED_TODAY');
  });
});
