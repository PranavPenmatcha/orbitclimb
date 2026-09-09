import { hashSeed, mulberry32, pickN } from './rng';
import type { CategoryId, Prompt } from './types';

export const PROMPTS_PER_ROUND = 7;

/** Today's date in US Eastern time as YYYY-MM-DD, the daily-reset boundary. */
export function currentPuzzleDateET(now: Date = new Date()): string {
  // en-CA locale formats as YYYY-MM-DD, which is exactly what we want.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function dailySeed(puzzleDate: string, categoryId: CategoryId): number {
  return hashSeed(`orbit:daily:${puzzleDate}:${categoryId}`);
}

export function unlimitedSeed(): number {
  return hashSeed(`orbit:unlimited:${Date.now()}:${Math.random()}`);
}

/**
 * Deterministically select PROMPTS_PER_ROUND prompts for a category given a
 * seed. Same seed -> same prompts, always, so the daily puzzle is identical
 * for every player and reproducible for scoring/debugging.
 */
export function selectPrompts(allPrompts: Prompt[], seed: number, count: number = PROMPTS_PER_ROUND): Prompt[] {
  const rng = mulberry32(seed);
  return pickN(allPrompts, Math.min(count, allPrompts.length), rng);
}
