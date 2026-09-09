import { describe, it, expect } from 'vitest';
import { buildIndex, matchAnswer } from '@/lib/match';
import type { AnswerEntry, Prompt } from '@/lib/types';

const pool: AnswerEntry[] = [
  { id: 'dolphin', name: 'Dolphin', tags: ['mammal', 'ocean'], weight: 0.05 },
  { id: 'octopus', name: 'Octopus', tags: ['invertebrate', 'ocean'], weight: 0.03 },
  { id: 'aye-aye', name: 'Aye-aye', aliases: ['aye aye'], tags: ['mammal', 'africa'], weight: 0.001 },
  { id: 'elephant', name: 'Elephant', tags: ['mammal', 'africa', 'asia'], weight: 0.08 },
];

const oceanMammalPrompt: Prompt = {
  id: 'p1',
  category: 'animals',
  text: 'Name a mammal that lives in the ocean',
  requireTags: ['mammal', 'ocean'],
};

describe('matchAnswer', () => {
  const index = buildIndex(pool);

  it('matches an exact canonical name', () => {
    const result = matchAnswer('Dolphin', index, oceanMammalPrompt);
    expect(result.kind).toBe('valid');
    if (result.kind === 'valid') {
      expect(result.answer.id).toBe('dolphin');
      expect(result.corrected).toBe(false);
    }
  });

  it('matches an alias', () => {
    const africaPrompt: Prompt = { id: 'p2', category: 'animals', text: '', requireTags: ['mammal', 'africa'] };
    const result = matchAnswer('aye aye', index, africaPrompt);
    expect(result.kind).toBe('valid');
  });

  it('corrects a small typo', () => {
    const result = matchAnswer('dolphn', index, oceanMammalPrompt);
    expect(result.kind).toBe('valid');
    if (result.kind === 'valid') {
      expect(result.answer.id).toBe('dolphin');
      expect(result.corrected).toBe(true);
    }
  });

  it('rejects an answer that fails the prompt tag with an explanatory reason', () => {
    const result = matchAnswer('Octopus', index, oceanMammalPrompt);
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid' && result.reason === 'wrong-tag') {
      expect(result.answer.id).toBe('octopus');
      expect(result.missingTag).toBe('mammal');
    } else {
      throw new Error('expected wrong-tag');
    }
  });

  it('rejects complete nonsense', () => {
    const result = matchAnswer('xyzzyplugh', index, oceanMammalPrompt);
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') expect(result.reason).toBe('no-match');
  });

  it('rejects empty input', () => {
    const result = matchAnswer('   ', index, oceanMammalPrompt);
    expect(result.kind).toBe('invalid');
  });

  it('does not fuzz-match short strings into wrong answers', () => {
    // "cat" vs any 4-letter pool word should not accidentally match at 0 tolerance
    const shortPool: AnswerEntry[] = [{ id: 'bat', name: 'Bat', tags: ['mammal'], weight: 0.01 }];
    const idx = buildIndex(shortPool);
    const prompt: Prompt = { id: 'p3', category: 'animals', text: '', requireTags: ['mammal'] };
    const result = matchAnswer('cat', idx, prompt);
    expect(result.kind).toBe('invalid');
  });
});
