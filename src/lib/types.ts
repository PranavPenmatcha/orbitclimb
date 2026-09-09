export type CategoryId =
  | 'stocks'
  | 'animals'
  | 'countries'
  | 'movies'
  | 'athletes'
  | 'games'
  | 'music';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  /** short glyph/icon token rendered in the picker, not an emoji-dependent asset */
  glyph: string;
}

export interface AnswerEntry {
  id: string;
  name: string;
  aliases?: string[];
  tags: string[];
  /** Hand-authored prior in (0,1): how readily a player reaches for this answer. */
  weight: number;
}

export interface Prompt {
  id: string;
  category: CategoryId;
  text: string;
  requireTags: string[];
  /** optional tags an answer must NOT have */
  excludeTags?: string[];
}

export type TierName =
  | 'deep-space'
  | 'orbital'
  | 'karman-line'
  | 'stratosphere'
  | 'contrail'
  | 'launchpad'
  | 'failed-to-launch';

export interface Tier {
  name: TierName;
  label: string;
  points: number;
  maxShare: number | null; // null = no upper bound requirement met (catch-all)
}

export type MatchResult =
  | { kind: 'invalid'; reason: 'no-match' }
  | { kind: 'invalid'; reason: 'wrong-tag'; answer: AnswerEntry; missingTag: string }
  | { kind: 'valid'; answer: AnswerEntry; corrected: boolean };
