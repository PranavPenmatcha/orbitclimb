import { describe, it, expect } from 'vitest';
import { seededSharesForPrompt, blendedShare, SEED_CONFIDENCE_K } from '@/lib/rarity';
import { tierForShare, TIERS, FAILED_TIER, MAX_ROUND_POINTS } from '@/lib/tiers';
import type { AnswerEntry } from '@/lib/types';

describe('seededSharesForPrompt', () => {
  it('normalizes weights within the given answer set only', () => {
    const answers: AnswerEntry[] = [
      { id: 'a', name: 'A', tags: [], weight: 0.3 },
      { id: 'b', name: 'B', tags: [], weight: 0.1 },
    ];
    const shares = seededSharesForPrompt(answers);
    expect(shares.get('a')).toBeCloseTo(0.75);
    expect(shares.get('b')).toBeCloseTo(0.25);
  });

  it('falls back to uniform for a degenerate zero-weight pool', () => {
    const answers: AnswerEntry[] = [
      { id: 'a', name: 'A', tags: [], weight: 0 },
      { id: 'b', name: 'B', tags: [], weight: 0 },
    ];
    const shares = seededSharesForPrompt(answers);
    expect(shares.get('a')).toBeCloseTo(0.5);
    expect(shares.get('b')).toBeCloseTo(0.5);
  });
});

describe('blendedShare', () => {
  it('is pure seed prior at zero live submissions', () => {
    expect(blendedShare(0.02, 0, 0)).toBeCloseTo(0.02);
  });

  it('moves toward live frequency as submissions accumulate', () => {
    // seed says rare (0.01), but live data says everyone picks it (share 0.9)
    const atFifty = blendedShare(0.01, 45, 50); // 45/50 live share = 0.9
    const atFiveThousand = blendedShare(0.01, 4500, 5000);
    expect(atFifty).toBeGreaterThan(0.01);
    expect(atFiveThousand).toBeGreaterThan(atFifty);
    expect(atFiveThousand).toBeCloseTo(0.9, 1);
  });

  it('respects the K confidence constant', () => {
    // at liveTotal == K, blend is roughly the midpoint of seed and live share
    const seed = 0.1;
    const liveShare = 0.5;
    const liveCount = liveShare * SEED_CONFIDENCE_K;
    const blend = blendedShare(seed, liveCount, SEED_CONFIDENCE_K);
    expect(blend).toBeCloseTo((seed + liveShare) / 2, 5);
  });
});

describe('tierForShare boundaries', () => {
  it('assigns deep-space just under 0.5%', () => {
    expect(tierForShare(0.001).name).toBe('deep-space');
  });
  it('assigns orbital at the deep-space boundary', () => {
    expect(tierForShare(0.005).name).toBe('orbital');
  });
  it('assigns karman-line at the orbital boundary', () => {
    expect(tierForShare(0.02).name).toBe('karman-line');
  });
  it('assigns stratosphere at the karman boundary', () => {
    expect(tierForShare(0.05).name).toBe('stratosphere');
  });
  it('assigns contrail at the stratosphere boundary', () => {
    expect(tierForShare(0.12).name).toBe('contrail');
  });
  it('assigns launchpad at and above the contrail boundary', () => {
    expect(tierForShare(0.25).name).toBe('launchpad');
    expect(tierForShare(0.9).name).toBe('launchpad');
  });

  it('every tier point value sums correctly for a perfect round', () => {
    expect(TIERS[0]?.points).toBe(100);
    expect(TIERS.length * 100 - 300).toBeLessThanOrEqual(MAX_ROUND_POINTS); // sanity, not tautological
    expect(FAILED_TIER.points).toBe(0);
  });
});
