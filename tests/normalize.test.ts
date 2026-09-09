import { describe, it, expect } from 'vitest';
import { normalize, levenshtein, toleranceFor } from '@/lib/normalize';

describe('normalize', () => {
  it('lowercases and trims', () => {
    expect(normalize('  Aye-Aye  ')).toBe('aye aye');
  });

  it('strips a leading article', () => {
    expect(normalize('The United States')).toBe('united states');
    expect(normalize('A Bug\'s Life')).toBe('bugs life');
  });

  it('strips diacritics', () => {
    expect(normalize('Pokémon')).toBe('pokemon');
    expect(normalize('Beyoncé')).toBe('beyonce');
  });

  it('keeps ampersands but strips other punctuation', () => {
    expect(normalize("AT&T")).toBe('at&t');
    expect(normalize("Ke$ha")).toBe('ke ha');
  });

  it('collapses whitespace', () => {
    expect(normalize('New   York')).toBe('new york');
  });
});

describe('levenshtein', () => {
  it('is 0 for identical strings', () => {
    expect(levenshtein('dolphin', 'dolphin')).toBe(0);
  });

  it('counts single edits', () => {
    expect(levenshtein('dolphin', 'dolphn')).toBe(1); // deletion
    expect(levenshtein('cat', 'cats')).toBe(1); // insertion
    expect(levenshtein('cat', 'cot')).toBe(1); // substitution
  });

  it('handles empty strings', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
});

describe('toleranceFor', () => {
  it('gives 0 tolerance for very short strings', () => {
    expect(toleranceFor(3)).toBe(0);
    expect(toleranceFor(4)).toBe(0);
  });
  it('gives 1 for medium strings', () => {
    expect(toleranceFor(5)).toBe(1);
    expect(toleranceFor(8)).toBe(1);
  });
  it('gives 2 for long strings', () => {
    expect(toleranceFor(9)).toBe(2);
    expect(toleranceFor(20)).toBe(2);
  });
});
