import type { Tier, TierName } from './types';

/**
 * The tier ladder. Ordered rarest-first; `maxShare` is the upper bound of
 * player-share this tier covers (exclusive). The last real tier (launchpad)
 * catches everything above stratosphere's bound.
 */
export const TIERS: Tier[] = [
  { name: 'deep-space', label: 'Deep Space', points: 100, maxShare: 0.005 },
  { name: 'orbital', label: 'Orbital', points: 85, maxShare: 0.02 },
  { name: 'karman-line', label: 'Kármán Line', points: 60, maxShare: 0.05 },
  { name: 'stratosphere', label: 'Stratosphere', points: 35, maxShare: 0.12 },
  { name: 'contrail', label: 'Contrail', points: 20, maxShare: 0.25 },
  { name: 'launchpad', label: 'Launchpad', points: 10, maxShare: null },
];

export const FAILED_TIER: Tier = {
  name: 'failed-to-launch',
  label: 'Failed to Launch',
  points: 0,
  maxShare: null,
};

/** Altitude waypoints, in the same km units as points (1 pt = 1 km). */
export const ALTITUDE_WAYPOINTS = [
  { km: 100, label: 'Kármán line' },
  { km: 400, label: 'ISS altitude' },
  { km: 700, label: 'Orbit' },
] as const;

export const MAX_ROUND_POINTS = 700; // 7 prompts * 100

export function tierForShare(share: number): Tier {
  for (const tier of TIERS) {
    if (tier.maxShare === null || share < tier.maxShare) return tier;
  }
  // unreachable given launchpad has maxShare null, but keep TS happy
  return TIERS[TIERS.length - 1] as Tier;
}

export function tierByName(name: TierName): Tier {
  if (name === 'failed-to-launch') return FAILED_TIER;
  const tier = TIERS.find((t) => t.name === name);
  if (!tier) throw new Error(`Unknown tier: ${name}`);
  return tier;
}
