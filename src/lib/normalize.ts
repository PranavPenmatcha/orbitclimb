/**
 * Text normalization + fuzzy matching used to compare a player's raw input
 * against canonical answer names/aliases. Pure, no I/O — safe to unit test
 * in isolation and safe to run server-side only.
 */

const LEADING_ARTICLE = /^(the|a|an)\s+/i;

/** Lowercase, strip diacritics/punctuation, collapse whitespace, drop a leading article. */
export function normalize(input: string): string {
  let s = input.normalize('NFD').replace(/[̀-ͯ]/g, ''); // strip accents
  s = s.toLowerCase();
  s = s.replace(LEADING_ARTICLE, '');
  s = s.replace(/['’]/g, ''); // drop apostrophes entirely: "bug's" -> "bugs"
  s = s.replace(/[^a-z0-9\s&]/g, ' '); // remaining punctuation -> space (keep & for e.g. "AT&T")
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** Standard Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  let prev = new Array<number>(bl + 1);
  let curr = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;

  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= bl; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1, // deletion
        (curr[j - 1] ?? 0) + 1, // insertion
        (prev[j - 1] ?? 0) + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[bl] ?? 0;
}

/** Max edit distance we'll tolerate as a "typo of" match, scaled by input length. */
export function toleranceFor(normalizedLength: number): number {
  if (normalizedLength <= 4) return 0; // too short to safely fuzz
  if (normalizedLength <= 8) return 1;
  return 2;
}
