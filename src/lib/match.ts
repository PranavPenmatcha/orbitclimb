import { normalize, levenshtein, toleranceFor } from './normalize';
import type { AnswerEntry, Prompt, MatchResult } from './types';

interface Indexed {
  entry: AnswerEntry;
  normalizedNames: string[]; // canonical + aliases, normalized
}

/** Build a lookup index for a category's answer pool. Cache per-category at call sites. */
export function buildIndex(pool: AnswerEntry[]): Indexed[] {
  return pool.map((entry) => ({
    entry,
    normalizedNames: [entry.name, ...(entry.aliases ?? [])].map(normalize),
  }));
}

function satisfiesPrompt(entry: AnswerEntry, prompt: Prompt): string | null {
  for (const tag of prompt.requireTags) {
    if (!entry.tags.includes(tag)) return tag;
  }
  if (prompt.excludeTags) {
    for (const tag of prompt.excludeTags) {
      if (entry.tags.includes(tag)) return tag;
    }
  }
  return null;
}

/**
 * Resolve a raw player input against a category's indexed answer pool for a
 * specific prompt. This is the sole source of truth for validity — must only
 * ever run server-side (see /api/round/answer).
 */
export function matchAnswer(rawInput: string, index: Indexed[], prompt: Prompt): MatchResult {
  const norm = normalize(rawInput);
  if (!norm) return { kind: 'invalid', reason: 'no-match' };

  // 1. exact match against any indexed name
  for (const item of index) {
    if (item.normalizedNames.includes(norm)) {
      const missing = satisfiesPrompt(item.entry, prompt);
      if (missing) return { kind: 'invalid', reason: 'wrong-tag', answer: item.entry, missingTag: missing };
      return { kind: 'valid', answer: item.entry, corrected: false };
    }
  }

  // 2. fuzzy match — smallest edit distance within tolerance wins
  const tolerance = toleranceFor(norm.length);
  if (tolerance > 0) {
    let best: { item: Indexed; dist: number } | null = null;
    for (const item of index) {
      for (const name of item.normalizedNames) {
        // skip wildly different lengths early, cheap guard before the O(nm) DP
        if (Math.abs(name.length - norm.length) > tolerance) continue;
        const dist = levenshtein(norm, name);
        if (dist <= tolerance && (!best || dist < best.dist)) {
          best = { item, dist };
        }
      }
    }
    if (best) {
      const missing = satisfiesPrompt(best.item.entry, prompt);
      if (missing) {
        return { kind: 'invalid', reason: 'wrong-tag', answer: best.item.entry, missingTag: missing };
      }
      return { kind: 'valid', answer: best.item.entry, corrected: true };
    }
  }

  return { kind: 'invalid', reason: 'no-match' };
}
