import { describe, it, expect } from 'vitest';
import { dailySeed, selectPrompts, currentPuzzleDateET } from '@/lib/daily';
import type { Prompt } from '@/lib/types';

function makePrompts(n: number): Prompt[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    category: 'animals',
    text: `prompt ${i}`,
    requireTags: [],
  }));
}

describe('daily puzzle determinism', () => {
  it('same date+category always yields the same 7 prompts', () => {
    const pool = makePrompts(20);
    const seed1 = dailySeed('2026-09-08', 'animals');
    const seed2 = dailySeed('2026-09-08', 'animals');
    expect(seed1).toBe(seed2);
    const a = selectPrompts(pool, seed1);
    const b = selectPrompts(pool, seed2);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(a).toHaveLength(7);
  });

  it('different categories on the same date yield different prompt sets', () => {
    const pool = makePrompts(20);
    const seedAnimals = dailySeed('2026-09-08', 'animals');
    const seedStocks = dailySeed('2026-09-08', 'stocks');
    expect(seedAnimals).not.toBe(seedStocks);
    const a = selectPrompts(pool, seedAnimals);
    const b = selectPrompts(pool, seedStocks);
    expect(a.map((p) => p.id)).not.toEqual(b.map((p) => p.id));
  });

  it('different dates yield different prompt sets', () => {
    const pool = makePrompts(20);
    const a = selectPrompts(pool, dailySeed('2026-09-08', 'animals'));
    const b = selectPrompts(pool, dailySeed('2026-09-09', 'animals'));
    expect(a.map((p) => p.id)).not.toEqual(b.map((p) => p.id));
  });

  it('never selects more prompts than exist in the pool', () => {
    const pool = makePrompts(3);
    const result = selectPrompts(pool, dailySeed('2026-09-08', 'animals'));
    expect(result.length).toBe(3);
  });

  it('formats the ET puzzle date as YYYY-MM-DD', () => {
    const d = currentPuzzleDateET(new Date('2026-09-08T12:00:00Z'));
    expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
