import type { AnswerEntry } from './types';

/**
 * Confidence in the seeded prior, expressed as "worth this many pseudo-votes".
 * At livePromptTotal = 0 the blend is pure seed; by a few hundred real
 * submissions the live distribution dominates.
 */
export const SEED_CONFIDENCE_K = 40;

/**
 * Normalize each answer's hand-authored weight into a probability *within
 * the set of answers valid for one prompt* (not the whole category pool).
 * This is what makes "ocean mammal" correctly treat Dolphin as obvious even
 * though dolphins are a small slice of "all animals".
 */
export function seededSharesForPrompt(validAnswers: AnswerEntry[]): Map<string, number> {
  const total = validAnswers.reduce((sum, a) => sum + a.weight, 0);
  const shares = new Map<string, number>();
  if (total <= 0) {
    // degenerate pool guard — fall back to uniform
    const uniform = validAnswers.length > 0 ? 1 / validAnswers.length : 0;
    for (const a of validAnswers) shares.set(a.id, uniform);
    return shares;
  }
  for (const a of validAnswers) shares.set(a.id, a.weight / total);
  return shares;
}

/**
 * Bayesian blend of the seeded prior share with live submission counts for
 * this specific prompt: p = (K*p_seed + liveCount) / (K + liveTotal).
 */
export function blendedShare(
  seedShare: number,
  liveCountForAnswer: number,
  livePromptTotal: number,
  k: number = SEED_CONFIDENCE_K
): number {
  return (k * seedShare + liveCountForAnswer) / (k + livePromptTotal);
}
